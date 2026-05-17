const { Client } = require('pg');
const { monumentos } = require('../src/data/monumentos');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'distravel',
  password: 'distravel_pass',
  port: 5432,
};

const seedPlaces = async () => {
  const client = new Client(pgConfig);
  try {
    await client.connect();
    console.log('✅ Conectado para volcar monumentos');

    for (const p of monumentos) {
      const extra = { ...p };
      delete extra.id; delete extra.name; delete extra.city; delete extra.category; 
      delete extra.description; delete extra.image; delete extra.accessibility;

      await client.query(`
        INSERT INTO places (id, name, city, category, description, image, accessibility, extra_data, verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `, [
        p.id, p.name, p.city, p.category, p.description, p.image, 
        p.accessibility || {}, extra, 1
      ]);
    }
    console.log(`✅ ${monumentos.length} monumentos volcados a PostgreSQL.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
};

seedPlaces();
