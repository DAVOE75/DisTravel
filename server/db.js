const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

const dbPath = path.join(__dirname, 'data', 'distravel.db');
fs.ensureDirSync(path.dirname(dbPath));

const db = new Database(dbPath);

// Inicializar tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS municipalities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    province TEXT,
    region TEXT,
    parent_code TEXT,
    population TEXT,
    history TEXT,
    geography TEXT,
    climate TEXT,
    landscape TEXT,
    gastronomy TEXT,
    festivities TEXT,
    patronal_fiesta TEXT,
    patronal_date TEXT,
    image_url TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    category TEXT,
    description TEXT,
    image TEXT,
    accessibility TEXT, -- JSON string
    extra_data TEXT,    -- JSON string for schedule, price, etc.
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_muni_name ON municipalities(normalized_name);
`);

console.log('[DB] Base de datos inicializada correctamente.');

module.exports = db;
