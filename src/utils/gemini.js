import { Alert } from 'react-native';
import { REAL_CITY_DATA } from '../data/municipiosIA';

/**
 * GeminiService: Motor Ultra-Resiliente con Mock Enriquecido
 */
export const GeminiService = {
  lastError: null,
  isRevoked: false,
  
  async generateContent(prompt, apiKey, openaiKey, base64Image = null) {
    this.lastError = null;
    this.isRevoked = false;
    const getCleanKey = (key) => {
      if (!key || typeof key !== 'string') return null;
      const k = key.trim().replace(/["']/g, '');
      return (k && k !== 'undefined' && k !== 'null' && k.length > 10) ? k : null;
    };
    const userKey = getCleanKey(apiKey);
    const envKey = getCleanKey(process.env.EXPO_PUBLIC_GEMINI_API_KEY) || "AIzaSyAdSjqkVFg1KGShwJEA1TLisd2xiAuXo5Q";
    const openAIKey = getCleanKey(openaiKey) || getCleanKey(process.env.EXPO_PUBLIC_OPENAI_API_KEY);

    if (apiKey || envKey) {
      const activeKey = apiKey || envKey;
      console.log(`[Gemini] Attempting with key: ${activeKey.substring(0, 8)}...`);
      const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-8b-latest'];
      for (const model of models) {
        const res = await this.tryGemini(prompt, activeKey, model, base64Image);
        if (res && res.length > 50) {
          console.log(`[Gemini] SUCCESS with model: ${model}`);
          return res;
        }
      }
    }
    if (!base64Image) {
      const res = await this.tryProxy(prompt);
      if (res) return res;
    }
    if (!base64Image && openAIKey) {
      const res = await this.tryOpenAI(prompt, openAIKey);
      if (res) return res;
    }
    return null;
  },

  async tryGemini(prompt, key, model, image) {
    const versions = ['v1beta', 'v1'];
    
    for (const version of versions) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const generationConfig = { 
        temperature: 0.1, 
        maxOutputTokens: 2048 
      };

      // response_mime_type solo es soportado en v1beta
      if (version === 'v1beta') {
        generationConfig.response_mime_type = "application/json";
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }, ...(image ? [{ inlineData: { mimeType: 'image/jpeg', data: image } }] : [])] }],
            generationConfig
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`[Gemini ${version}] [${model}] Success: ${text.substring(0, 100)}...`);
            return text;
          }
        }
        
        if (response.status >= 400) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error?.message || '';
          if (errorMsg.includes('leaked') || response.status === 403) {
            this.isRevoked = true;
          }
          this.lastError = errorMsg;
          console.warn(`[Gemini ${version}] Error ${response.status}:`, errorData);
        }
      } catch (e) {
        clearTimeout(timeoutId);
        if (e.name !== 'AbortError') {
          this.lastError = e.message;
          console.warn(`[Gemini] Fetch error (${version}):`, e);
        }
      }
    }
    return null;
  },

  async tryProxy(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('http://82.223.44.196:3000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelName: 'gemini-2.0-flash-exp' }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return data.text || null;
      }
    } catch (e) { clearTimeout(timeoutId); }
    return null;
  },

  async tryOpenAI(prompt, key) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) { clearTimeout(timeoutId); }
    return null;
  },

  async getPlaceData(placeName, city, apiKey, category = 'Cultura', openaiKey = null) {
    try {
      const prompt = `Actúa como un experto en turismo y accesibilidad en España. 
      INVESTIGACIÓN OBLIGATORIA: Busca y genera una ficha técnica REAL, PROFESIONAL y TOTALMENTE ACTUALIZADA de "${placeName}" en "${city}, España". 
      REGLAS CRÍTICAS:
      1. NO INVENTES DATOS. Si no conoces el teléfono o la web real, intenta deducirla o búscala en tu base de datos de 2024/2025.
      2. TARIFAS: Deben ser las oficiales. Si es un museo público en España, recuerda que suele haber gratuidad para PCD >= 33% y acompañante.
      3. HORARIOS: Proporciona los horarios de invierno/verano reales.
      4. ACCESIBILIDAD: Sé muy específico sobre rampas, ascensores y bucles magnéticos.
      5. FORMATO: Responde ÚNICAMENTE con un objeto JSON válido (application/json).

      ESTRUCTURA JSON:
      {
        "name": "Nombre oficial completo",
        "city": "${city}",
        "category": "${category}",
        "description": "Descripción profesional extensa (>300 palabras)",
        "history": "Historia detallada (>400 palabras)",
        "address": "Dirección exacta y completa",
        "phone": "Teléfono real con prefijo",
        "web": "URL oficial completa",
        "accessibility": {
          "physical": true/false, "visual": true/false, "hearing": true/false, "cognitive": true/false,
          "details": "Detalles técnicos de accesibilidad para cada tipo de discapacidad"
        },
        "technicalSpecs": {
          "ramps": true, "lifts": true, "braille": true, "magneticLoop": true, "accessibleParking": true, "wheelchairRental": true
        },
        "tariffs": [
          { "preset": "general", "label": "Entrada General", "price": "10.00", "condition": { "type": "none", "value": "", "from": "", "to": "" } },
          { "preset": "disability", "label": "PCD (>=33%)", "price": "0.00", "condition": { "type": "disability", "value": "33", "from": "", "to": "" } }
        ],
        "schedules": [
          { "name": "Horario Invierno", "period": "Anual", "weekday": "10:00 - 20:00", "weekend": "10:00 - 14:00", "festive": "Cerrado" }
        ],
        "services": {
          "audioguide": { "has": true, "price": "0.00", "isFreePCD": true, "languages": ["Español", "Inglés"] }
        },
        "importantNotices": ["Aviso sobre acceso o gratuidad ciertos días"],
        "criticalNotices": ["Avisos urgentes o de seguridad"],
        "touristTips": ["Consejo experto para el visitante"],
        "tags": ["etiqueta1", "etiqueta2", "monumento"],
        "location": { "latitude": 40.0, "longitude": -3.0 }
      }`;

      let result = await this.generateContent(prompt, apiKey, openaiKey);
      const mockData = this.generateMockPlaceData(placeName, city, category);
      console.log(`[Gemini] Primary result: ${result ? 'SUCCESS' : 'FAILED'}`);
      
      if (!result) {
        console.warn('[Gemini] Primary prompt failed, trying simplified fallback...');
        const simplePrompt = `Genera JSON REAL de "${placeName}" en "${city}". Incluye name, address, phone, web, touristTips, tags, criticalNotices, importantNotices, tariffs (con condition), schedules, location.`;
        result = await this.generateContent(simplePrompt, apiKey, openaiKey);
      }

      if (result) {
        let parsed = this.extractJSON(result);
        if (parsed) {
          console.log(`[Gemini] Parsed success for ${parsed.name}`);
          
          // Normalización de campos Distravel
          parsed.website = parsed.web || parsed.website || "";
          parsed.touristTip = parsed.touristTip || (Array.isArray(parsed.touristTips) ? parsed.touristTips.join('. ') : parsed.touristTips) || "";
          parsed.tags = Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || "");
          parsed.criticalNotices = Array.isArray(parsed.criticalNotices) ? parsed.criticalNotices : 
                                   (Array.isArray(parsed.importantNotices) ? parsed.importantNotices : 
                                   (parsed.criticalNotices ? [parsed.criticalNotices] : []));
          
          // Inyectar datos reales específicos para casos conocidos si la IA falla
          const n = (parsed.name || '').toLowerCase();
          const c = (parsed.city || '').toLowerCase();
          
          if ((n.includes('arqueológico') || n.includes('marq')) && c.includes('alicante')) {
            parsed.name = "MARQ - Museo Arqueológico Provincial de Alicante";
            parsed.website = "https://www.marqalicante.com";
            parsed.phone = "+34 965 149 000";
            parsed.address = "Plaza Dr. Gómez Ulla, s/n, 03013 Alicante";
            parsed.description = parsed.description || "El MARQ es un museo vanguardista que apuesta por la arqueología del siglo XXI. Ofrece una visión moderna y accesible del patrimonio histórico de Alicante.";
          }
          
          return { 
            ...mockData,
            ...parsed, 
            isAI: true,
            isMock: false
          };
        }
      }
      
      return mockData;
    } catch (e) { 
      console.error('[Gemini] Critical error in getPlaceData:', e);
      return this.generateMockPlaceData(placeName, city, category); 
    }
  },

  async getCityData(cityName, apiKey, openaiKey = null) {
    try {
      const normalizedCity = cityName.toLowerCase().trim();
      if (REAL_CITY_DATA[normalizedCity]) return { ...REAL_CITY_DATA[normalizedCity], name: cityName, isVerified: true };
      
      const prompt = `Realiza una investigación exhaustiva del municipio de "${cityName}, España" para una aplicación de turismo accesible.
      
      Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
      {
        "name": "Nombre oficial",
        "province": "Provincia",
        "region": "Comunidad Autónoma",
        "population": "Número de habitantes (ej: 30.000)",
        "fiesta": "Nombre de la fiesta patronal principal",
        "fiesta_date": "Fecha o periodo de la fiesta",
        "description": "Descripción turística general (150 palabras)",
        "history": "Historia detallada desde sus orígenes (300 palabras)",
        "geography": "Descripción del relieve, altitud y situación geográfica (200 palabras)",
        "climate": "Tipo de clima y temperaturas medias (150 palabras)",
        "landscape": "Flora, fauna y entornos naturales destacados (150 palabras)",
        "gastronomy": "Platos típicos, productos locales y tradiciones culinarias (200 palabras)",
        "festivities": "Calendario de ferias, romerías y eventos culturales (200 palabras)",
        "transports": {
          "bus": true/false,
          "taxi": true/false,
          "tram": true/false,
          "train": true/false,
          "plane": true/false,
          "details": "Información sobre accesibilidad en el transporte local"
        }
      }`;

      const result = await this.generateContent(prompt, apiKey, openaiKey);
      const mockData = this.generateMockCityData(cityName);
      
      if (!result) return mockData;
      
      let parsed = this.extractJSON(result);
      if (parsed) {
        // Normalización para Distravel
        parsed.fiesta_date = parsed.fiesta_date || parsed.fiestaDate || "";
        
        // Mezcla inteligente: Usar IA pero rellenar huecos con el "Texto Sugerido" (Mock)
        return { 
          ...mockData,
          ...parsed, 
          isAI: true,
          isMock: false 
        };
      }
      
      return mockData;
    } catch (e) { 
      console.error("[Gemini] Error en getCityData:", e);
      return this.generateMockCityData(cityName); 
    }
  },

  extractJSON(text) {
    try {
      let str = text.trim();
      const match = str.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) str = match[1].trim();
      const start = str.indexOf('{');
      const end = str.lastIndexOf('}');
      if (start === -1 || end === -1) return null;
      return JSON.parse(str.substring(start, end + 1));
    } catch (e) { return null; }
  },
  
  FAMOUS_PLACES: {
    "marq": {
      address: "Plaza Dr. Gómez Ulla, s/n, 03013 Alicante",
      web: "https://www.marqalicante.com",
      phone: "+34 965 149 000",
      description: "El MARQ es un museo vanguardista que apuesta por la arqueología del siglo XXI. Ofrece una visión moderna y accesible del patrimonio histórico de Alicante, habiendo sido galardonado como Museo Europeo del Año en 2004.",
      history: "Ubicado en el antiguo Hospital de San Juan de Dios, el museo fue inaugurado en su sede actual en 2002. Su innovadora museografía utiliza recursos audiovisuales y escenográficos para acercar la historia al gran público.",
      tariffs: [
        { id: "m1", preset: "general", label: "General", price: "5.00" },
        { id: "m2", preset: "senior", label: "Reducida (Estudiantes/Jubilados)", price: "3.00" },
        { id: "m3", preset: "disability", label: "PCD + Acompañante", price: "0.00" }
      ],
      schedules: [
        { id: "ms1", name: "Horario Invierno", period: "Septiembre a Junio", weekday: "10:00 - 19:00", weekend: "10:00 - 14:00", festive: "10:00 - 14:00" }
      ],
      location: { latitude: 38.3540, longitude: -0.4760 }
    },
    "museo arqueológico alicante": {
      address: "Plaza Dr. Gómez Ulla, s/n, 03013 Alicante",
      web: "https://www.marqalicante.com",
      phone: "+34 965 149 000",
      description: "El MARQ es un museo vanguardista que apuesta por la arqueología del siglo XXI. Ofrece una visión moderna y accesible del patrimonio histórico de Alicante.",
      history: "Ubicado en el antiguo Hospital de San Juan de Dios, el museo fue inaugurado en su sede actual en 2002.",
      tariffs: [
        { id: "ma1", preset: "general", label: "General", price: "5.00" },
        { id: "ma2", preset: "disability", label: "PCD + Acompañante", price: "0.00" }
      ],
      location: { latitude: 38.3540, longitude: -0.4760 }
    },
    "museo del prado": {
      address: "Calle de Ruiz de Alarcón, 23, 28014 Madrid",
      web: "https://www.museodelprado.es",
      phone: "+34 913 302 800",
      description: "El Museo Nacional del Prado es uno de los museos más importantes del mundo, así como uno de los más visitados. Singularmente rico en cuadros de maestros europeos de los siglos XVI al XIX, su principal atractivo radica en la amplia presencia de Velázquez, el Greco, Goya, Tiziano, Rubens y el Bosco.",
      history: "Inaugurado el 19 de noviembre de 1819 bajo el reinado de Fernando VII, el edificio fue diseñado originalmente por Juan de Villanueva en 1785 por orden de Carlos III para albergar el Gabinete de Historia Natural. Durante la Guerra de la Independencia fue cuartel de caballería, pero finalmente se convirtió en la pinacoteca real que hoy conocemos.",
      tariffs: [
        { id: "p1", preset: "general", label: "General", price: "15.00" },
        { id: "p2", preset: "senior", label: "Reducida", price: "7.50" },
        { id: "p3", preset: "disability", label: "PCD / Desempleados", price: "0.00" }
      ],
      location: { latitude: 40.4137, longitude: -3.6921 }
    },
    "sagrada familia": {
      address: "C/ de Mallorca, 401, 08013 Barcelona",
      web: "https://sagradafamilia.org",
      phone: "+34 932 080 414",
      description: "La Basílica de la Sagrada Familia es un gran templo católico de Barcelona, diseñado por el arquitecto Antoni Gaudí. Iniciada en 1882, todavía está en construcción. Es la obra maestra de Gaudí y el máximo exponente de la arquitectura modernista catalana.",
      history: "Gaudí asumió el proyecto en 1883, dedicando los últimos 43 años de su vida exclusivamente a esta obra. Tras su muerte in 1926, el proyecto continuó bajo diversos arquitectos siguiendo sus planos originales, enfrentándose a incendios y desafíos técnicos monumentales.",
      tariffs: [
        { id: "s1", preset: "general", label: "General con APP", price: "26.00" },
        { id: "s2", preset: "disability", label: "PCD + Acompañante", price: "0.00" }
      ],
      location: { latitude: 41.4036, longitude: 2.1744 }
    },
    "alhambra": {
      address: "Calle Real de la Alhambra, s/n, 18009 Granada",
      web: "https://www.alhambra-patronato.es",
      phone: "+34 958 027 971",
      description: "La Alhambra es un complejo monumental palaciego y fortaleza que alojaba al monarca y a la corte del Reino Nazarí de Granada. Es uno de los monumentos más visitados de España y una cumbre del arte andalusí.",
      history: "Su nombre procede del color de sus muros (Al-Hamra, la Roja). Fue concebida como una zona militar en el siglo IX, pero se convirtió en residencia real en el siglo XIII con la llegada de la dinastía nazarí.",
      tariffs: [
        { id: "a1", preset: "general", label: "Alhambra General", price: "19.00" },
        { id: "a2", preset: "senior", label: "Mayores 65", price: "12.00" }
      ],
      location: { latitude: 37.1760, longitude: -3.5881 }
    },
    "mezquita de cordoba": {
      address: "Calle Cardenal Herrero, 1, 14003 Córdoba",
      web: "https://mezquita-catedraldecordoba.es",
      phone: "+34 957 439 175",
      description: "La Mezquita-Catedral de Córdoba es el monumento más importante de todo el Occidente islámico y uno de los más asombrosos del mundo. En su historia se resume la evolución completa del estilo omeya en España.",
      history: "Se empezó a construir en el año 786 sobre la antigua basílica visigótica de San Vicente. Tras la conquista cristiana en 1236, se convirtió en catedral, integrando estilos góticos, renacentistas y barrocos.",
      tariffs: [
        { id: "m1", preset: "general", label: "General", price: "13.00" },
        { id: "m2", preset: "senior", label: "Reducida", price: "10.00" }
      ],
      location: { latitude: 37.8791, longitude: -4.7797 }
    },
    "palacio real": {
      address: "Calle de Bailén, s/n, 28071 Madrid",
      web: "https://www.patrimonionacional.es",
      phone: "+34 914 548 700",
      description: "El Palacio Real de Madrid es la residencia oficial del rey de España; no obstante, los actuales reyes no habitan en él, sino en el Palacio de la Zarzuela. Es el palacio real más grande de Europa Occidental.",
      history: "Fue construido por orden de Felipe V sobre el solar del antiguo Alcázar de Madrid, destruido por un incendio en 1734. Las obras comenzaron en 1738 con el arquitecto Filippo Juvarra.",
      tariffs: [
        { id: "pr1", preset: "general", label: "Tarifa Básica", price: "12.00" },
        { id: "pr2", preset: "senior", label: "Reducida", price: "6.00" }
      ],
      location: { latitude: 40.4179, longitude: -3.7143 }
    }
  },

  generateMockPlaceData(name, city, category) {
    const normName = (name || "").toLowerCase().trim();
    console.log(`[IA Local] Buscando coincidencia para: "${normName}"`);
    // Búsqueda flexible en FAMOUS_PLACES
    let famous = null;
    for (const key in this.FAMOUS_PLACES) {
      if (normName.includes(key) || key.includes(normName)) {
        famous = this.FAMOUS_PLACES[key];
        break;
      }
    }
    
    return {
      name: name || "Nuevo Lugar",
      city: city || "Desconocida",
      category: category || "Cultura",
      description: famous?.description || `El ${name} es un punto de interés destacado en ${city}. Este lugar es fundamental para entender la oferta cultural y turística de la zona, atrayendo a numerosos visitantes cada año por su valor arquitectónico y social.`,
      history: famous?.history || `La historia de ${name} se remonta a épocas pasadas, habiendo evolucionado junto al municipio de ${city}. Ha servido como testigo de los cambios históricos más relevantes de la región, conservando hasta hoy la esencia que lo hace único y especial para sus habitantes.`,
      address: famous?.address || `Plaza Mayor, 1, ${city}`,
      phone: famous?.phone || "+34 912 345 678",
      web: famous?.web || `https://www.distravel.app/${(name || "").toLowerCase().replace(/\s/g, '-')}`,
      accessibility: famous ? { physical: true, visual: true, hearing: true, cognitive: true, details: "Accesibilidad total certificada." } : { physical: true, visual: false, hearing: false, cognitive: true, details: "Cuenta con accesibilidad general en las zonas principales." },
      technicalSpecs: famous ? { ramps: true, lifts: true, braille: true, magneticLoop: true, accessibleParking: true, wheelchairRental: true } : { ramps: true, lifts: true, braille: false, magneticLoop: false, accessibleParking: true, wheelchairRental: true },
      tariffs: famous?.tariffs || [
        { id: "t1", preset: "general", label: "Entrada General", price: "10.00" }, 
        { id: "t2", preset: "disability", label: "PCD", price: "0.00" }
      ],
      schedules: [{ id: "s1", name: "Horario General", period: "Todo el año", weekday: "10:00 - 18:00", weekend: "10:00 - 14:00", festive: "Cerrado" }],
      services: {
        audioguide: { has: true, price: "3.50", isFreePCD: false },
        guidedVisits: { has: false, price: "0.00", isFreePCD: true }
      },
      touristTip: famous?.touristTip || "Se recomienda visitar a primera hora para evitar aglomeraciones.",
      tags: famous?.tags || "Cultura, Monumento, Accesible",
      criticalNotices: famous?.criticalNotices || ["Acceso restringido en festivos locales"],
      location: famous?.location || { latitude: 40.4168, longitude: -3.7038 },
      isMock: true,
      isFamous: !!famous
    };
  },

  generateMockCityData(name) {
    return {
      name: name || "Municipio",
      description: `Este municipio es un rincón con encanto que combina tradición y modernidad. Sus calles y plazas reflejan la rica herencia cultural de la región, ofreciendo al visitante una experiencia auténtica y acogedora.`,
      history: `Fundado en tiempos históricos, el municipio ha crecido gracias al esfuerzo de sus gentes, manteniendo vivas sus tradiciones mientras se adapta a los nuevos tiempos. Ha servido como nudo de comunicaciones y centro comercial de su comarca.`,
      geography: `Situado en una zona de relieve variado, el municipio cuenta con una altitud media que le proporciona vistas panorámicas de los valles circundantes. Su ubicación es estratégica para el acceso a las principales rutas de la provincia.`,
      climate: "Mediterráneo templado con inviernos suaves y veranos cálidos. Las precipitaciones son moderadas y se concentran en otoño y primavera.",
      landscape: "El entorno natural está caracterizado por bosques mediterráneos y zonas de cultivo tradicional. Existen rutas de senderismo adaptadas que permiten disfrutar de la biodiversidad local.",
      gastronomy: "La cocina local se basa en productos de la tierra, destacando los guisos tradicionales, embutidos artesanales y repostería típica heredada de generaciones pasadas.",
      festivities: "El calendario festivo es amplio, destacando la Fiesta Mayor, ferias de artesanía y celebraciones tradicionales que involucran a toda la comunidad en eventos inclusivos.",
      transports: { bus: true, taxi: true, tram: false, train: false, plane: false, details: "Servicio de transporte local disponible con flota parcialmente adaptada para PMR." },
      fiesta: "Fiestas Mayores Patronales",
      population: "Datos según último censo municipal",
      isMock: true
    };
  }
};
