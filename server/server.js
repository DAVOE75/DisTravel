const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const db = require('./db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
console.log(`[AI] Model initialized. Key starts with: ${key.substring(0, 5)}... ends with: ...${key.substring(key.length - 5)}`);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir la Web Administrativa (React)
const ADMIN_DIST_DIR = path.join(__dirname, '../admin-web/dist');
app.use(express.static(ADMIN_DIST_DIR));

// Asegurar directorios
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOADS_DIR);

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Rutas log
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- HEALTH ---
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'online', database: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'offline', error: e.message });
  }
});

// --- STATS ---
app.get('/api/stats', async (req, res) => {
  try {
    const places = await db.query('SELECT count(*) FROM places');
    const municipalities = await db.query('SELECT count(*) FROM municipalities WHERE image_url IS NOT NULL');
    const users = await db.query('SELECT count(*) FROM users');
    
    // Obtener actividad reciente (últimos 5 monumentos)
    const recentPlaces = await db.query(`
      SELECT id, name, city, created_at, verified 
      FROM places 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    res.json({
      totalPlaces: parseInt(places.rows[0].count),
      totalMunicipalities: parseInt(municipalities.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      recentActivity: recentPlaces.rows.map(p => ({
        id: p.id,
        type: 'place',
        title: 'Nuevo monumento añadido',
        subtitle: `${p.name}, ${p.city}`,
        timestamp: p.created_at,
        verified: p.verified
      }))
    });
  } catch (e) { 
    console.error('Stats Error:', e);
    res.status(500).json({ error: e.message }); 
  }
});

// --- AI GENERATION ---
app.post('/api/ai/generate-place-data', async (req, res) => {
  const { name, city } = req.body;
  if (!name || !city) return res.status(400).json({ error: 'Name and city are required' });

  const prompt = `Actúa como un experto en turismo y accesibilidad. 
  Genera información técnica para el monumento: "${name}" en "${city}".
  Devuelve ÚNICAMENTE un objeto JSON válido (sin markdown):
  {
    "description": "descripción breve (máx 200 caracteres)",
    "accessibility": {
      "ramp": true/false, "elevator": true/false, "audioGuide": true/false, "braille": true/false, "adaptedToilet": true/false
    },
    "extra_data": {
      "website": "url", "phone": "tel", "schedule": "horario", "price": "precio"
    },
    "location": { "lat": latitud, "lng": longitud }
  }`;

  try {
    console.time(`[AI] ${name}`);
    let result;
    try {
      const primaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      result = await primaryModel.generateContent(prompt);
    } catch (aiErr) {
      console.warn('[AI] Primary model failed, trying fallback:', aiErr.message);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      result = await fallbackModel.generateContent(prompt);
    }
    console.timeEnd(`[AI] ${name}`);
    
    const response = await result.response;
    const text = response.text();
    
    // Extraer JSON si hay markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    res.json(JSON.parse(cleanJson));
  } catch (e) { 
    console.error('AI Error:', e);
    res.status(500).json({ error: e.message }); 
  }
});

// Subida de imágenes
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image' });
  // Retornamos la URL absoluta o relativa al proxy de Nginx
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// --- USUARIOS ---

app.post('/api/users/sync', async (req, res) => {
  try {
    const { id, email, name, xp, level, medals, data } = req.body;
    await db.query(`
      INSERT INTO users (id, email, name, xp, level, medals, data)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        medals = EXCLUDED.medals,
        data = EXCLUDED.data
    `, [id, email, name, xp || 0, level || 1, medals || [], data || {}]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY xp DESC LIMIT 100');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- MUNICIPIOS ---
// ... (mantenemos los anteriores) ...

app.get('/api/municipalities', async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    let query = 'SELECT * FROM municipalities';
    let params = [];
    if (search) {
      query += ' WHERE normalized_name LIKE $1 OR name LIKE $2';
      const p = `%${search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")}%`;
      params = [p, p];
    }
    query += ` ORDER BY (image_url IS NOT NULL) DESC, population DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    const result = await db.query(query, params);
    res.json(result.rows.map(r => ({ ...r, fiesta: r.patronal_fiesta, fiesta_date: r.patronal_date })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/municipalities/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM municipalities WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const r = result.rows[0];
    res.json({ ...r, fiesta: r.patronal_fiesta, fiesta_date: r.patronal_date });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/municipalities/:id', async (req, res) => {
  try {
    const { 
      image_url, population, patronal_fiesta, patronal_date, description,
      history, geography, climate, landscape, gastronomy, festivities, transports
    } = req.body;
    
    const fields = [];
    const params = [];
    let i = 1;

    const updatableFields = {
      image_url, population, patronal_fiesta, patronal_date, description,
      history, geography, climate, landscape, gastronomy, festivities, transports
    };

    Object.entries(updatableFields).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${i++}`);
        params.push(value);
      }
    });

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);
    const query = `UPDATE municipalities SET ${fields.join(', ')} WHERE id = $${i}`;
    
    const result = await db.query(query, params);
    res.json({ success: result.rowCount > 0 });
  } catch (e) { 
    console.error('Update Municipality Error:', e);
    res.status(500).json({ error: e.message }); 
  }
});

// --- PLACES ---

app.get('/api/places', async (req, res) => {
  try {
    const { city, verified } = req.query;
    let query = 'SELECT * FROM places';
    let params = [];
    let conditions = [];
    
    if (city) { conditions.push(`city = $${params.length + 1}`); params.push(city); }
    if (verified === 'true') { conditions.push(`verified = true`); }
    
    if (conditions.length > 0) { query += ' WHERE ' + conditions.join(' AND '); }
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/places', async (req, res) => {
  try {
    const p = req.body;
    const extra = { ...p };
    ['id', 'name', 'city', 'category', 'description', 'image', 'accessibility', 'location'].forEach(k => delete extra[k]);
    await db.query(`
      INSERT INTO places (id, name, city, category, description, image, accessibility, extra_data, verified, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET extra_data = EXCLUDED.extra_data, image = EXCLUDED.image, location = EXCLUDED.location
    `, [p.id, p.name, p.city, p.category || 'Otros', p.description || '', p.image, p.accessibility || {}, extra, 0, p.location || null]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const up = req.body;
    const current = await db.query('SELECT * FROM places WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const fields = []; const params = []; let i = 1;
    ['name', 'city', 'category', 'description', 'image', 'location'].forEach(f => {
      if (up[f] !== undefined) { fields.push(`${f} = $${i++}`); params.push(up[f]); }
    });
    if (up.verified !== undefined) { fields.push(`verified = $${i++}`); params.push(!!up.verified); }
    if (up.accessibility) { fields.push(`accessibility = $${i++}`); params.push(up.accessibility); }

    // Merge extra_data
    const currentExtra = current.rows[0].extra_data || {};
    const dbColumns = ['id', 'name', 'city', 'category', 'description', 'image', 'accessibility', 'location', 'verified', 'extra_data', 'created_at', 'rating'];
    const extraFromRoot = {};
    Object.keys(up).forEach(k => {
      if (!dbColumns.includes(k)) {
        extraFromRoot[k] = up[k];
      }
    });

    const newExtra = { 
      ...currentExtra, 
      ...(up.extra_data || {}),
      ...extraFromRoot
    };
    
    fields.push(`extra_data = $${i++}`); params.push(newExtra);
    
    if (fields.length === 0) return res.status(400).json({ error: 'No updates' });
    params.push(id);
    await db.query(`UPDATE places SET ${fields.join(', ')} WHERE id = $${i}`, params);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/places/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM places WHERE id = $1', [req.params.id]);
    res.json({ success: result.rowCount > 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- RESEÑAS ---

app.get('/api/places/:id/reviews', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reviews WHERE place_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { place_id, user_id, user_name, rating, comment } = req.body;
    await db.query(`
      INSERT INTO reviews (place_id, user_id, user_name, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
    `, [place_id, user_id, user_name, rating, comment]);
    
    // Actualizar rating promedio en places
    await db.query(`
      UPDATE places 
      SET rating = (SELECT AVG(rating) FROM reviews WHERE place_id = $1)
      WHERE id = $1
    `, [place_id]);
    
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SOCIAL / COMUNIDAD ---

app.get('/api/social/feed', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.name as user_name, u.profile_image as user_avatar
      FROM places p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/social/action', async (req, res) => {
  try {
    const { user_id, place_id, type, content } = req.body;
    await db.query(`
      INSERT INTO social_actions (user_id, place_id, type, content)
      VALUES ($1, $2, $3, $4)
    `, [user_id, place_id, type, content]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Debug Panel
app.get('/debug', async (req, res) => {
  try {
    const munis = await db.query('SELECT * FROM municipalities WHERE image_url IS NOT NULL');
    const places = await db.query('SELECT count(*) FROM places');
    let html = `
      <html><body style="font-family:sans-serif;background:#0a192f;color:white;padding:20px;">
      <h1>Distravel PostgreSQL Debug</h1>
      <p>Lugares: ${places.rows[0].count} | Municipios con foto: ${munis.rows.length}</p>
      <table border="1" style="border-collapse:collapse;width:100%;">
      <tr style="background:#1e3a8a;"><th>ID</th><th>Ciudad</th><th>Imagen</th></tr>
      ${munis.rows.map(m => `<tr><td>${m.id}</td><td>${m.name}</td><td><img src="${m.image_url.startsWith('http') ? m.image_url : 'https://distravel.hesiox.es'+m.image_url}" width="100"/></td></tr>`).join('')}
      </table></body></html>`;
    res.send(html);
  } catch (e) { res.send(e.message); }
});

app.get('/api/expo-config', (req, res) => {
  res.json({
    url: process.env.EXPO_URL || 'https://distravel.hesiox.es',
    tunnel: false
  });
});

app.use((req, res) => {
  res.sendFile(path.join(ADMIN_DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Ready on ${PORT}`));
