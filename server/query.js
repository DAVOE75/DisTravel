const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'distravel.db');
const db = new Database(dbPath);

const sql = process.argv[2] || 'SELECT name FROM sqlite_master WHERE type="table"';

try {
  const result = db.prepare(sql).all();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error ejecutando SQL:', error.message);
}
