const Database = require('better-sqlite3');
const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'distravel.db');
const MONUMENTOS_JS = path.join(__dirname, '..', 'src', 'data', 'monumentos.js');

const db = new Database(DB_PATH);

async function migrate() {
  console.log('🚀 Iniciando Migración de Monumentos...');

  // Leer el archivo monumentos.js
  const content = await fs.readFile(MONUMENTOS_JS, 'utf8');
  
  // Extraer el objeto MONUMENTOS (truco sucio para no complicar el parser)
  // En un entorno real usaríamos un parser de JS o exportaríamos a JSON
  const monumentosMatch = content.match(/export const MONUMENTOS = (\{[\s\S]*\});/);
  if (!monumentosMatch) {
    console.error('❌ No se pudo encontrar el objeto MONUMENTOS en el archivo.');
    return;
  }

  // Evaluar el contenido para obtener el objeto (CUIDADO: eval es peligroso, pero aquí controlamos el archivo)
  let monumentos;
  try {
    // Limpiamos un poco para que sea un JS evaluable
    const jsCode = monumentosMatch[1];
    monumentos = eval('(' + jsCode + ')');
  } catch (e) {
    console.error('❌ Error al evaluar monumentos.js:', e.message);
    return;
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO places 
    (id, name, city, category, description, image, accessibility, extra_data, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((data) => {
    let count = 0;
    for (const [cityName, list] of Object.entries(data)) {
      for (const place of list) {
        const accessibility = JSON.stringify({
          physical: place.suitability?.includes('MOTOR') || false,
          visual: place.suitability?.includes('VISUAL') || false,
          auditory: place.suitability?.includes('AUDITORY') || false,
          cognitive: place.suitability?.includes('COGNITIVE') || false
        });

        const extraData = JSON.stringify({
          schedule: place.schedule,
          price: place.price,
          disabilityBenefit: place.disabilityBenefit,
          technicalSpecs: place.technicalSpecs,
          audioguide: place.audioguide,
          suitability: place.suitability,
          verifiedByCommunity: place.verifiedByCommunity,
          location: place.location,
          workingHours: place.workingHours,
          tariffs: place.tariffs,
          seasons: place.seasons,
          importantNotices: place.importantNotices
        });

        insert.run(
          place.id,
          place.name,
          cityName,
          place.category,
          place.description,
          place.image,
          accessibility,
          extraData,
          1 // Marcamos como verificado ya que es data oficial
        );
        count++;
      }
    }
    return count;
  });

  const total = transaction(monumentos);
  console.log(`✅ Migración de monumentos completada. ${total} lugares insertados.`);
}

migrate().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
