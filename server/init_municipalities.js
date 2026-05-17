const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

const dbPath = path.join(__dirname, 'data', 'distravel.db');
const db = new Database(dbPath);

const normalize = (text) => {
  if (!text) return '';
  return text.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/y/g, 'i')
    .replace(/[^a-z0-9]/g, '');
};

const init = async () => {
  try {
    const municipiosPath = path.join(__dirname, '..', 'src', 'data', 'municipios.json');
    const municipios = fs.readJsonSync(municipiosPath);
    
    console.log(`[INIT] Cargando ${municipios.length} municipios...`);
    
    const insert = db.prepare(`
      INSERT OR IGNORE INTO municipalities (name, normalized_name, parent_code)
      VALUES (?, ?, ?)
    `);
    
    const transaction = db.transaction((list) => {
      for (const m of list) {
        insert.run(m.label, normalize(m.label), m.parent_code);
      }
    });
    
    transaction(municipios);
    console.log('✅ Municipios inicializados correctamente.');
    
    // Verificar Alicante
    const alicante = db.prepare("SELECT * FROM municipalities WHERE normalized_name = 'alicante'").get();
    console.log('Alicante en BD:', alicante);
    
  } catch (err) {
    console.error('❌ Error en init:', err);
  } finally {
    db.close();
  }
};

init();
