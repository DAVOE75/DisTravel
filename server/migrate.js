const db = require('./db');
const fs = require('fs-extra');
const path = require('path');

// Función para normalizar nombres
const normalize = (text) => {
  if (!text) return '';
  return text.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/y/g, 'i');
};

async function migrate() {
  console.log('[MIGRATE] Iniciando migración de datos...');

  // 1. Cargar Población
  const poblacionPath = path.join(__dirname, '..', 'src', 'data', 'poblacion.js');
  const poblacionContent = await fs.readFile(poblacionPath, 'utf8');
  const poblacionMatch = poblacionContent.match(/export const POBLACION_DATA = ({[\s\S]*?});/);
  
  let poblacionData = {};
  if (poblacionMatch) {
    try {
      // Limpieza básica para poder evaluar como JS (esto es un hack pero efectivo para este caso controlado)
      const cleanJson = poblacionMatch[1].replace(/\/\/.*$/gm, '').replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
      // No es JSON puro (tiene comas finales, etc), usaremos una aproximación más sencilla
    } catch(e) {}
  }

  // Mejor: Usar regex para extraer pares clave-valor
  const entries = [];
  const regex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = regex.exec(poblacionContent)) !== null) {
    entries.push({ name: match[1], pop: match[2] });
  }

  console.log(`[MIGRATE] Encontrados ${entries.length} registros de población.`);

  // 2. Cargar Fiestas
  const fiestasPath = path.join(__dirname, '..', 'src', 'data', 'fiestasPatronales.js');
  const fiestasContent = await fs.readFile(fiestasPath, 'utf8');
  const fiestasData = {};
  const fiestaRegex = /['"]([^'"]+)['"]\s*:\s*{\s*fiesta\s*:\s*['"]([^'"]+)['"]\s*,\s*fecha\s*:\s*['"]([^'"]+)['"]\s*}/g;
  while ((match = fiestaRegex.exec(fiestasContent)) !== null) {
    fiestasData[normalize(match[1])] = { fiesta: match[2], fecha: match[3] };
  }

  // 3. Cargar Datos IA Real
  const iaPath = path.join(__dirname, '..', 'src', 'data', 'municipiosIA.js');
  const iaContent = await fs.readFile(iaPath, 'utf8');
  const iaDataMap = {};
  // Este es más complejo, usaremos un match por bloques
  const iaBlockRegex = /['"]([^'"]+)['"]\s*:\s*{([\s\S]*?)}/g;
  while ((match = iaBlockRegex.exec(iaContent)) !== null) {
    const cityKey = normalize(match[1]);
    const block = match[2];
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

  // 4. Insertar en BD
  const insert = db.prepare(`
    INSERT INTO municipalities 
    (name, normalized_name, population, patronal_fiesta, patronal_date, history, geography, climate, landscape, gastronomy, festivities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((data) => {
    for (const entry of data) {
      const norm = normalize(entry.name);
      const fiesta = fiestasData[norm] || { fiesta: 'Consultar Calendario Local', fecha: 'Variable' };
      const ia = iaDataMap[norm] || {};
      
      insert.run(
        entry.name,
        norm,
        entry.pop,
        fiesta.fiesta,
        fiesta.fecha,
        ia.history,
        ia.geography,
        ia.climate,
        ia.landscape,
        ia.gastronomy,
        ia.festivities
      );
    }
  });

  transaction(entries);
  console.log('[MIGRATE] Migración completada con éxito.');
}

migrate().catch(console.error);
