/**
 * Calcula el ahorro potencial en un lugar para una persona con discapacidad.
 * Soporta múltiples formatos de datos (objetos tariffs, strings de precio, etc.)
 */
export const calculatePlaceSavings = (place) => {
  if (!place) return null;

  // 1. Caso: El lugar ya tiene el campo tariffs (formato nuevo de usuario/IA)
  if (place.tariffs && Array.isArray(place.tariffs) && place.tariffs.length > 0) {
    const findValue = (keywords) => {
      const tariff = place.tariffs.find(t => 
        keywords.some(k => t.label.toLowerCase().includes(k))
      );
      if (!tariff) return null;
      // Soportamos tanto 'value' como 'price' (AddLocation usa price, PlaceDetail usaba value)
      const val = tariff.value !== undefined ? tariff.value : tariff.price;
      if (typeof val === 'string' && val.toLowerCase().includes('gratis')) return 0;
      return parseFloat(val);
    };

    const generalVal = findValue(['general', 'adulto', 'completa']);
    // Priorizamos palabras clave específicas de discapacidad antes que 'reducida' genérica
    let pcdVal = findValue(['pcd', 'pmr', 'discapacidad']);
    if (pcdVal === null) {
      pcdVal = findValue(['reducida']);
    }

    if (generalVal !== null && pcdVal !== null && !isNaN(generalVal) && !isNaN(pcdVal)) {
      const diff = generalVal - pcdVal;
      return diff > 0 ? diff.toFixed(2) : null;
    }
  }

  // 2. Caso: Parsing de string 'price' (formato de monumentos.js)
  // Ejemplo: "General: 15€. Reducida: 7.50€."
  if (place.price && typeof place.price === 'string') {
    const priceStr = place.price;
    
    // Intentar extraer precios usando regex
    const extractPrice = (pattern) => {
      const match = priceStr.match(pattern);
      if (match) {
        // Limpiar símbolos de euro y comas
        const valStr = match[1].replace(',', '.').replace('€', '').trim();
        return parseFloat(valStr);
      }
      return null;
    };

    // Buscamos patrones comunes
    const generalPrice = extractPrice(/General:\s*([\d,.]+)/i) || extractPrice(/Completa:\s*([\d,.]+)/i);
    const pcdPrice = extractPrice(/Reducida:\s*([\d,.]+)/i) || extractPrice(/Reducida PCD:\s*([\d,.]+)/i);

    // Caso especial: "5€ (Reducida PCD: 3€)"
    if (generalPrice === null) {
      const simpleMatch = priceStr.match(/^([\d,.]+)\s*€/);
      if (simpleMatch) {
         const gen = parseFloat(simpleMatch[1].replace(',', '.'));
         const redMatch = priceStr.match(/Reducida[^:]*:\s*([\d,.]+)/i);
         if (redMatch) {
            const red = parseFloat(redMatch[1].replace(',', '.'));
            const diff = gen - red;
            return diff > 0 ? diff.toFixed(2) : null;
         }
      }
    }

    if (generalPrice !== null && pcdPrice !== null && !isNaN(generalPrice) && !isNaN(pcdPrice)) {
      const diff = generalPrice - pcdPrice;
      return diff > 0 ? diff.toFixed(2) : null;
    }

    // 3. Caso: Gratis para PCD (Ahorro es el precio general completo)
    const isPcdFree = 
      (place.disabilityBenefit && place.disabilityBenefit.toLowerCase().includes('gratis')) ||
      (place.price && place.price.toLowerCase().includes('gratis') && place.price.toLowerCase().includes('pcd'));

    if (isPcdFree && generalPrice !== null) {
      return generalPrice.toFixed(2);
    }
  }

  // 4. Caso extremo: disabilityBenefit dice "GRATIS" y price tiene un precio general al principio
  if (place.disabilityBenefit && place.disabilityBenefit.toLowerCase().includes('gratis')) {
    if (place.price && typeof place.price === 'string') {
      const match = place.price.match(/([\d,.]+)\s*€/);
      if (match) {
        return parseFloat(match[1].replace(',', '.')).toFixed(2);
      }
    }
  }

  return null;
};
