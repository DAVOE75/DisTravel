const Database = require('better-sqlite3');
const fs = require('fs-extra');
const path = require('path');

// Configuración de rutas
const DB_PATH = path.join(__dirname, 'data', 'distravel.db');
const MUNICIPIOS_JSON = path.join(__dirname, '..', 'src', 'data', 'municipios.json');
const POBLACION_JS = path.join(__dirname, '..', 'src', 'data', 'poblacion.js');
const FIESTAS_JS = path.join(__dirname, '..', 'src', 'data', 'fiestasPatronales.js');
const IA_JS = path.join(__dirname, '..', 'src', 'data', 'municipiosIA.js');
const PROVINCES_JS = path.join(__dirname, '..', 'src', 'data', 'provinces.js');

const db = new Database(DB_PATH);

// Función para normalizar nombres
const normalize = (text) => {
  if (!text) return '';
  return text.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/y/g, 'i');
};

async function migrate() {
  console.log('🚀 Iniciando Migración Masiva Distravel v2.1 (Enriquecida)...');

  // 1. Cargar Municipios Base
  const municipiosRaw = await fs.readJson(MUNICIPIOS_JSON);
  console.log(`📦 Cargados ${municipiosRaw.length} municipios base.`);

  // 2. Cargar Provincias y Regiones
  const provincesContent = await fs.readFile(PROVINCES_JS, 'utf8');
  const ineProvinces = {};
  const provinceToRegion = {};
  
  const ineRegex = /"(\d{2})"\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = ineRegex.exec(provincesContent)) !== null) {
    ineProvinces[m[1]] = m[2];
  }
  
  const regionRegex = /'([^']+)'\s*:\s*'([^']+)'/g;
  while ((m = regionRegex.exec(provincesContent)) !== null) {
    provinceToRegion[m[1]] = m[2];
  }
  console.log(`🗺️ Provincias: ${Object.keys(ineProvinces).length}, Mapeo Regiones: ${Object.keys(provinceToRegion).length}`);

  // 3. Cargar Población
  const poblacionContent = await fs.readFile(POBLACION_JS, 'utf8');
  const poblacionData = {};
  const popRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  while ((m = popRegex.exec(poblacionContent)) !== null) {
    poblacionData[normalize(m[1])] = m[2];
  }

  // 4. Cargar Fiestas
  const fiestasContent = await fs.readFile(FIESTAS_JS, 'utf8');
  const fiestasData = {};
  const fiestaRegex = /['"]([^'"]+)['"]\s*:\s*{\s*fiesta\s*:\s*['"]([^'"]+)['"]\s*,\s*fecha\s*:\s*['"]([^'"]+)['"]\s*}/g;
  while ((m = fiestaRegex.exec(fiestasContent)) !== null) {
    fiestasData[normalize(m[1])] = { fiesta: m[2], fecha: m[3] };
  }

  // 5. Cargar Datos IA
  const iaContent = await fs.readFile(IA_JS, 'utf8');
  const iaDataMap = {};
  const iaBlockRegex = /['"]([^'"]+)['"]\s*:\s*{([\s\S]*?)}/g;
  while ((m = iaBlockRegex.exec(iaContent)) !== null) {
    const cityKey = normalize(m[1]);
    const block = m[2];
    const getField = (f) => {
      const fr = new RegExp(`${f}\\s*:\\s*["']([^"']+)["']`);
      const fm = block.match(fr);
      return fm ? fm[1] : null;
    };
    iaDataMap[cityKey] = {
      history: getField('history'),
      geography: getField('geography'),
      climate: getField('climate'),
      landscape: getField('landscape'),
      gastronomy: getField('gastronomy'),
      festivities: getField('festivities')
    };
  }

  // 6. Preparar Base de Datos (Asegurar columna parent_code)
  try { db.exec('ALTER TABLE municipalities ADD COLUMN parent_code TEXT'); } catch(e) {} // Por si ya existe
  db.exec('DELETE FROM municipalities');

  const insert = db.prepare(`
    INSERT INTO municipalities 
    (name, normalized_name, province, region, parent_code, population, patronal_fiesta, patronal_date, history, geography, climate, landscape, gastronomy, festivities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 7. Ejecutar Inserción en Transacción
  const transaction = db.transaction((data) => {
    for (const entry of data) {
      const name = entry.label;
      const norm = normalize(name);
      const pCode = entry.parent_code;
      const province = ineProvinces[pCode] || null;
      const region = province ? (provinceToRegion[province] || null) : null;
      
      const pop = poblacionData[norm] || 'Municipio rural (< 5.000 hab.)';
      const fiesta = fiestasData[norm] || { fiesta: 'Fiestas Mayores', fecha: 'Consultar Calendario' };
      const ia = iaDataMap[norm] || {};
      
      insert.run(
        name,
        norm,
        province,
        region,
        pCode,
        pop,
        fiesta.fiesta,
        fiesta.fecha,
        ia.history || null,
        ia.geography || null,
        ia.climate || null,
        ia.landscape || null,
        ia.gastronomy || null,
        ia.festivities || null
      );
    }
    return data.length;
  });

  const total = transaction(municipiosRaw);
  console.log(`✅ Migración completada con éxito. ${total} municipios enriquecidos e insertados.`);
}

migrate().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
