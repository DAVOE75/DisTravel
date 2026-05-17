const xlsx = require('xlsx');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'distravel',
  password: 'distravel_pass',
  port: 5432,
});

const normalize = (text) => {
  if (!text) return '';
  return text.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/y/g, 'i');
};

const normalizeClean = (text) => {
  return normalize(text).replace(/[^a-z0-9]/g, '');
};

const MANUAL_MAPPING = {
  '03_alcosser': '03_alcocer de planes',
  '03_fageca': '03_facheca',
  '09_santa maria ribarredonda': '09_santa maria rivarredonda',
  '12_herbers': '12_herbes',
  '17_castell d\'aro, platja d\'aro i s\'agaro': '17_castell-platja d\'aro',
  '24_valle de ancares': '24_candin',
  '43_bisbal de montsant, la': '43_bisbal de falset, la',
  '43_rapita, la': '43_sant carles de la rapita',
  '46_alfarb': '46_alfarp'
};

async function runImport() {
  console.log('📊 Iniciando importación de Padrón 2025 desde Excel...');
  
  const filePath = path.join(__dirname, '..', 'pobmun25.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const excelData = xlsx.utils.sheet_to_json(sheet);

  console.log(`📦 Leídas ${excelData.length} filas desde el archivo Excel.`);

  const dbRes = await pool.query('SELECT id, name, normalized_name, parent_code FROM municipalities');
  const dbRows = dbRes.rows;
  console.log(`🗄️ Leídos ${dbRows.length} municipios desde PostgreSQL.`);

  // Create lookup maps
  const dbMap = new Map();
  dbRows.forEach(row => {
    const key = `${row.parent_code}_${row.normalized_name}`;
    dbMap.set(key, row);
  });

  const dbByProvince = {};
  dbRows.forEach(row => {
    if (!dbByProvince[row.parent_code]) {
      dbByProvince[row.parent_code] = [];
    }
    dbByProvince[row.parent_code].push(row);
  });

  let updatedCount = 0;
  let skippedCount = 0;

  // Begin transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const row of excelData) {
      const cpro = row.CPRO;
      const name = row.NOMBRE;
      const populationVal = parseInt(row.POB25);
      
      if (isNaN(populationVal)) {
        console.warn(`⚠️ Fila con población inválida: ${name} (${row.POB25})`);
        continue;
      }

      const normalizedName = normalize(name);
      let key = `${cpro}_${normalizedName}`;

      // Check manual mapping first
      if (MANUAL_MAPPING[key]) {
        key = MANUAL_MAPPING[key];
      }

      let matchedMuni = null;

      // 1. Direct match
      if (dbMap.has(key)) {
        matchedMuni = dbMap.get(key);
      } else {
        // 2. Bilingual swap swap
        if (normalizedName.includes('/')) {
          const parts = normalizedName.split('/');
          const swappedName = `${parts[1]}/${parts[0]}`;
          const swappedKey = `${cpro}_${swappedName}`;
          if (dbMap.has(swappedKey)) {
            matchedMuni = dbMap.get(swappedKey);
          }
        }

        // 3. Clean/Fuzzy matching
        if (!matchedMuni) {
          const cleanExcel = normalizeClean(name);
          const candidates = dbByProvince[cpro] || [];
          
          for (const cand of candidates) {
            const cleanCand = normalizeClean(cand.name);
            if (cleanCand === cleanExcel) {
              matchedMuni = cand;
              break;
            }
          }

          if (!matchedMuni) {
            for (const cand of candidates) {
              const cleanCand = normalizeClean(cand.name);
              if (cleanCand.includes(cleanExcel) || cleanExcel.includes(cleanCand)) {
                matchedMuni = cand;
                break;
              }
            }
          }
        }
      }

      if (matchedMuni) {
        // Format to Spanish dots string: e.g. 338577 -> "338.577"
        const formattedPopulation = populationVal.toLocaleString('de-DE');

        await client.query(
          'UPDATE municipalities SET population = $1, population_int = $2 WHERE id = $3',
          [formattedPopulation, populationVal, matchedMuni.id]
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`\n🎉 ¡Importación completada con éxito!`);
    console.log(`✅ Municipios actualizados con población 2025 exacta: ${updatedCount}`);
    console.log(`⚠️ Municipios omitidos (ej. Usansolo/nuevas segregaciones): ${skippedCount}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la importación:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
