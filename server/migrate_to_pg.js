const { Client } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

const sqliteDbPath = path.join(__dirname, 'data', 'distravel.db');
const sqliteDb = new Database(sqliteDbPath);

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'distravel',
  password: 'distravel_pass',
  port: 5432,
};

const migrate = async () => {
  const pgClient = new Client(pgConfig);
  try {
    await pgClient.connect();
    console.log('✅ Conectado a PostgreSQL');

    // 1. Crear tablas
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS municipalities (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS places (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        category TEXT,
        description TEXT,
        image TEXT,
        accessibility JSONB,
        extra_data JSONB,
        verified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tablas creadas en PostgreSQL');

    // 2. Migrar Municipios
    const munis = sqliteDb.prepare('SELECT * FROM municipalities').all();
    console.log(`Migrando ${munis.length} municipios...`);
    
    for (const m of munis) {
      await pgClient.query(`
        INSERT INTO municipalities (id, name, normalized_name, province, region, parent_code, image_url, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url
      `, [m.id, m.name, m.normalized_name, m.province, m.region, m.parent_code, m.image_url, m.is_verified]);
    }

    // 3. Migrar Lugares
    const places = sqliteDb.prepare('SELECT * FROM places').all();
    console.log(`Migrando ${places.length} lugares...`);
    
    for (const p of places) {
      await pgClient.query(`
        INSERT INTO places (id, name, city, category, description, image, accessibility, extra_data, verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, p.name, p.city, p.category, p.description, p.image, p.accessibility, p.extra_data, p.verified]);
    }

    console.log('🚀 Migración completada con éxito.');

  } catch (err) {
    console.error('❌ Error en migración:', err);
  } finally {
    await pgClient.end();
    sqliteDb.close();
  }
};

migrate();
