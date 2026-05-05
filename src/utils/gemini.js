import { Alert } from 'react-native';
import { REAL_CITY_DATA } from '../data/municipiosIA';

/**
 * GeminiService: Motor Ultra-Resiliente con Mock Enriquecido
 */
export const GeminiService = {
  lastError: null,
  
  async generateContent(prompt, apiKey, openaiKey, base64Image = null) {
    this.lastError = null;
    const getCleanKey = (key) => {
      if (!key || typeof key !== 'string') return null;
      const k = key.trim().replace(/["']/g, '');
      return (k && k !== 'undefined' && k !== 'null' && k.length > 10) ? k : null;
    };
    const userKey = getCleanKey(apiKey);
    const envKey = getCleanKey(process.env.EXPO_PUBLIC_GEMINI_API_KEY) || "AIzaSyAOdSrIAyrWtijiXk-onTgxbTnMEhblrHU";
    const openAIKey = getCleanKey(openaiKey) || getCleanKey(process.env.EXPO_PUBLIC_OPENAI_API_KEY);

    if (userKey) {
      const res = await this.tryGemini(prompt, userKey, 'gemini-1.5-flash', base64Image);
      if (res) return res;
    }
    if (envKey) {
      const res = await this.tryGemini(prompt, envKey, 'gemini-1.5-flash', base64Image);
      if (res) return res;
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }, ...(image ? [{ inlineData: { mimeType: 'image/jpeg', data: image } }] : [])] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
      return null;
    } catch (e) {
      clearTimeout(timeoutId);
      return null;
    }
  },

  async tryProxy(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('http://82.223.44.196:3000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelName: 'gemini-1.5-flash' }),
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
      const prompt = `Genera una ficha técnica REAL y MUY EXTENSA en JSON de "${placeName}" en "${city}, España". Responde SOLO JSON con: name, city, category, description (mínimo 300 palabras), history (mínimo 400 palabras), accessibility (details), tariffs[{label, price}], schedules[{name, period, weekday, weekend, festive}], importantNotices[], location{latitude, longitude}.`;
      const result = await this.generateContent(prompt, apiKey, openaiKey);
      if (!result) return this.generateMockPlaceData(placeName, city, category);
      const parsed = this.extractJSON(result);
      return parsed ? { ...parsed, isAI: true } : this.generateMockPlaceData(placeName, city, category);
    } catch (e) { return this.generateMockPlaceData(placeName, city, category); }
  },

  async getCityData(cityName, apiKey, openaiKey = null) {
    try {
      const normalizedCity = cityName.toLowerCase().trim();
      if (REAL_CITY_DATA[normalizedCity]) return { ...REAL_CITY_DATA[normalizedCity], name: cityName, isVerified: true };
      const prompt = `Investigación municipal de "${cityName}, España". JSON: name, province, region, population, fiesta, fiestaDate, description, history, climate, landscape, gastronomy, festivities, transports{bus, taxi, tram, train, plane, details}.`;
      const result = await this.generateContent(prompt, apiKey, openaiKey);
      if (!result) return this.generateMockCityData(cityName);
      const parsed = this.extractJSON(result);
      return parsed ? { ...parsed, isAI: true } : this.generateMockCityData(cityName);
    } catch (e) { return this.generateMockCityData(cityName); }
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

  generateMockPlaceData(name, city, category) {
    return {
      name: name || "Nuevo Lugar",
      city: city || "Desconocida",
      category: category || "Cultura",
      description: `El ${name} es un punto de interés destacado en ${city}. Este lugar es fundamental para entender la oferta cultural y turística de la zona, atrayendo a numerosos visitantes cada año por su valor arquitectónico y social.`,
      history: `La historia de ${name} se remonta a épocas pasadas, habiendo evolucionado junto al municipio de ${city}. Ha servido como testigo de los cambios históricos más relevantes de la región, conservando hasta hoy la esencia que lo hace único y especial para sus habitantes.`,
      accessibility: { physical: true, visual: false, auditory: false, cognitive: true, details: "Cuenta con accesibilidad general en las zonas principales." },
      tariffs: [{ id: "t1", label: "General", price: "Consultar" }, { id: "t2", label: "PCD", price: "Gratis" }],
      schedules: [{ id: "s1", name: "Horario General", period: "Todo el año", weekday: "10:00 - 18:00", weekend: "10:00 - 14:00", festive: "Cerrado" }],
      importantNotices: ["Se recomienda reserva previa", "Acceso gratuito para personas con discapacidad"],
      isMock: true
    };
  },

  generateMockCityData(name) {
    return {
      name: name || "Municipio",
      description: `Este municipio es un rincón con encanto que combina tradición y modernidad. Sus calles y plazas reflejan la rica herencia cultural de la región, ofreciendo al visitante una experiencia auténtica y acogedora.`,
      history: `Fundado en tiempos históricos, el municipio ha crecido gracias al esfuerzo de sus gentes, manteniendo vivas sus tradiciones mientras se adapta a los nuevos tiempos.`,
      climate: "Mediterráneo templado.",
      transports: { bus: true, taxi: true, tram: false, train: false, plane: false, details: "Servicio de transporte local disponible." },
      isMock: true
    };
  }
};
