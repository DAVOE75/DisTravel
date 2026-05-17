const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'distravel',
  password: 'distravel_pass',
  port: 5432,
});

// Probar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err);
  } else {
    console.log('✅ PostgreSQL conectado y listo.');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
