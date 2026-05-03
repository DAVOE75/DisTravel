const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar directorios
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOADS_DIR);


// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory rate limiting simple implementation
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

const simpleRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }
  
  const userData = rateLimitMap.get(ip);
  if (now - userData.startTime > RATE_LIMIT_WINDOW) {
    userData.count = 1;
    userData.startTime = now;
    return next();
  }
  
  userData.count++;
  if (userData.count > MAX_REQUESTS_PER_WINDOW) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ error: 'Demasiadas peticiones. Por favor, inténtalo más tarde.' });
  }
  
  next();
};

app.use(simpleRateLimiter);

// Rutas
app.get('/', (req, res) => {
  res.send('Distravel Backend API v1.1 - Hardened & Secure');
});

// Endpoint para subir imágenes
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  console.log(`Imagen subida: ${req.file.filename}`);
  res.json({ 
    success: true, 
    url: imageUrl,
    filename: req.file.filename 
  });
});

// --- ENDPOINT: MUNICIPIOS ---

// Buscar municipios o listar destacados
app.get('/api/municipalities', (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    let query = 'SELECT * FROM municipalities';
    let params = [];

    if (search) {
      query += ' WHERE normalized_name LIKE ? OR name LIKE ?';
      const searchParam = `%${search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}%`;
      params = [searchParam, searchParam];
    }

    query += ' ORDER BY population DESC LIMIT ?';
    params.push(parseInt(limit));

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar municipios' });
  }
});

// Obtener detalle de un municipio
app.get('/api/municipalities/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM municipalities WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Municipio no encontrado' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar municipio' });
  }
});

// --- ENDPOINT: PLACES (LUGARES COMPARTIDOS) ---

// Obtener lugares compartidos
app.get('/api/places', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM places ORDER BY created_at DESC').all();
    // Parsear el campo accessibility que guardamos como JSON string
    const parsedRows = rows.map(r => ({
      ...r,
      accessibility: JSON.parse(r.accessibility || '{}'),
      verified: !!r.verified
    }));
    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer lugares' });
  }
});

// Añadir un nuevo lugar compartido
app.post('/api/places', (req, res) => {
  try {
    const newPlace = req.body;
    const requiredFields = ['id', 'name', 'city', 'image'];
    const missingFields = requiredFields.filter(f => !newPlace[f]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Faltan campos obligatorios', details: missingFields });
    }

    const accessibility = JSON.stringify(newPlace.accessibility || { physical: false, visual: false, auditory: false, cognitive: false });
    
    const stmt = db.prepare(`
      INSERT INTO places (id, name, city, category, description, image, accessibility, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newPlace.id,
      newPlace.name,
      newPlace.city,
      newPlace.category || 'Otros',
      newPlace.description || '',
      newPlace.image,
      accessibility,
      0
    );
    
    res.json({ success: true, place: newPlace });
  } catch (error) {
    console.error('Error al guardar lugar:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'El lugar ya existe con este ID' });
    }
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Actualizar un lugar
app.patch('/api/places/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Solo permitimos ciertos campos para actualizar vía PATCH simple
    const fields = [];
    const params = [];

    if (updates.verified !== undefined) {
      fields.push('verified = ?');
      params.push(updates.verified ? 1 : 0);
    }
    if (updates.category) {
      fields.push('category = ?');
      params.push(updates.category);
    }
    if (updates.description) {
      fields.push('description = ?');
      params.push(updates.description);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' });

    params.push(id);
    const stmt = db.prepare(`UPDATE places SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...params);

    if (result.changes === 0) return res.status(404).json({ error: 'Lugar no encontrado' });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el lugar' });
  }
});

// Eliminar un lugar
app.delete('/api/places/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM places WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Lugar no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el lugar' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[DISTRAVEL SERVER] Corriendo en puerto ${PORT}`);
  console.log(`[DISTRAVEL SERVER] Modo: ${process.env.NODE_ENV || 'development'}`);
});
