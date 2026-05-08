const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

const dbPath = path.join(__dirname, 'data', 'distravel.db');
const db = new Database(dbPath);

try {
  db.exec('DELETE FROM places');
  db.exec('DELETE FROM municipalities');
  db.exec('VACUUM');
  console.log('✅ Base de datos limpiada correctamente.');
  
  const jsonPath = path.join(__dirname, 'data', 'places.json');
  fs.writeJsonSync(jsonPath, []);
  console.log('✅ places.json reseteado.');
} catch (err) {
  console.error('❌ Error al limpiar:', err);
} finally {
  db.close();
}
