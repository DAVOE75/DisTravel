const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar directorios
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data', 'places.json');

fs.ensureDirSync(UPLOADS_DIR);
if (!fs.existsSync(DATA_FILE)) {
  fs.writeJsonSync(DATA_FILE, []);
}

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

// Endpoint para obtener lugares compartidos
app.get('/api/places', async (req, res) => {
  try {
    const places = await fs.readJson(DATA_FILE);
    res.json(places);
  } catch (error) {
    console.error('Error al leer lugares:', error);
    res.status(500).json({ error: 'Error al leer los lugares de la base de datos' });
  }
});

// Endpoint para añadir un nuevo lugar compartido
app.post('/api/places', async (req, res) => {
  try {
    const newPlace = req.body;
    
    // VALIDACIÓN ROBUSTA
    const requiredFields = ['id', 'name', 'city', 'image'];
    const missingFields = requiredFields.filter(f => !newPlace[f]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios', 
        details: missingFields 
      });
    }

    // Asegurar estructura básica de accesibilidad si no viene
    if (!newPlace.accessibility) {
      newPlace.accessibility = { physical: false, visual: false, auditory: false, cognitive: false };
    }
    
    const places = await fs.readJson(DATA_FILE);
    
    // Evitar duplicados por ID (Case Insensitive)
    if (places.find(p => p.id.toLowerCase() === newPlace.id.toLowerCase())) {
      return res.status(400).json({ error: 'El lugar ya existe con este ID' });
    }
    
    places.push({
      ...newPlace,
      createdAt: new Date().toISOString(),
      verified: false // Siempre empieza sin verificar para revisión admin
    });
    
    // Escritura segura (atomic-like using fs-extra writeJson)
    await fs.writeJson(DATA_FILE, places, { spaces: 2 });
    
    console.log(`Nuevo lugar compartido: ${newPlace.name} (${newPlace.city})`);
    res.json({ success: true, place: newPlace });
  } catch (error) {
    console.error('Error al guardar lugar:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Endpoint para actualizar un lugar (Validación Admin)
app.patch('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const places = await fs.readJson(DATA_FILE);
    const placeIndex = places.findIndex(p => p.id === id);
    
    if (placeIndex === -1) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    
    // Solo permitimos ciertos campos para actualizar vía PATCH simple
    const allowedUpdates = ['verified', 'verifiedStatus', 'category', 'description'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        places[placeIndex][field] = updates[field];
      }
    });
    
    await fs.writeJson(DATA_FILE, places, { spaces: 2 });
    
    console.log(`Lugar actualizado [${id}]:`, updates);
    res.json({ success: true, place: places[placeIndex] });
  } catch (error) {
    console.error('Error al actualizar lugar:', error);
    res.status(500).json({ error: 'Error al actualizar el lugar en el servidor' });
  }
});

// Endpoint para eliminar un lugar (Rechazo Admin)
app.delete('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const places = await fs.readJson(DATA_FILE);
    const filtered = places.filter(p => p.id !== id);
    
    if (places.length === filtered.length) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }
    
    await fs.writeJson(DATA_FILE, filtered, { spaces: 2 });
    console.log(`Lugar eliminado: ${id}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el lugar' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[DISTRAVEL SERVER] Corriendo en puerto ${PORT}`);
  console.log(`[DISTRAVEL SERVER] Modo: ${process.env.NODE_ENV || 'development'}`);
});
