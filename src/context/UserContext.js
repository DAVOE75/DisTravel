import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from '../config/api';
const { getInfoAsync, makeDirectoryAsync, copyAsync, documentDirectory } = FileSystem;

const UserContext = createContext();

const STORAGE_KEY = '@distravel_user_data';

const SEED_DATA = [];

const INITIAL_USER_DATA = {
  name: '',
  lastName: '',
  birthDate: '',
  email: '',
  phone: '',
  phonePrefix: '+34',
  country: 'España',
  address: '',
  disabilityDegree: '',
  issuingBody: '',
  expiryDate: '',
  idCardImage: null,
  profileImage: null,
  isLoggedIn: false,
  voiceGuidance: false,
  highContrast: false,
  isAdmin: true,
  id: 'guest',
  contributions: SEED_DATA, // Inicializar con semillas
  customCityData: {},
  disabilityType: 'MOTOR',
  visitedPlaces: [], // Para calcular ahorro real
  totalSavings: 0,   // Ahorro acumulado
  verifiedPlaces: [], // Lugares validados por el usuario
  experience: 0,      // Puntos de experiencia (XP)
  level: 1,           // Nivel actual
  badges: [],         // Insignias ganadas
  unlockedTitles: ['Viajero Novel'], // Títulos ganados
  aiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '', // Clave de API para Gemini desde entorno o vacía
  openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '', // Clave de API para OpenAI como fallback
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(INITIAL_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('Distravel v3.0: Iniciando carga de datos...');
      setIsLoading(true);
      try {
        // 1. Cargar datos desde el almacenamiento único
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        let parsed = jsonValue != null ? JSON.parse(jsonValue) : INITIAL_USER_DATA;
        
        // LIMPIEZA FORZADA: Si hay datos de Alicante (semillas antiguas), los borramos
        if (parsed.contributions && parsed.contributions.some(p => p.city === 'Alicante' || p.cityName === 'Alicante')) {
          console.log('Distravel: Detectados datos antiguos de Alicante. Limpiando...');
          parsed.contributions = [];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        
        let currentContributions = parsed.contributions || [];
        
        // Añadir semillas si no existen o actualizar si han cambiado campos clave
        SEED_DATA.forEach(seed => {
          const idx = currentContributions.findIndex(p => p && p.id === seed.id);
          if (idx === -1) {
            currentContributions.push(seed);
          } else {
            const existing = currentContributions[idx];
            const userHasCustomImage = existing.image && existing.image !== seed.image && !existing.image.includes('unsplash.com');
            currentContributions[idx] = { ...seed, ...existing, id: seed.id };
            if (!userHasCustomImage && seed.image && seed.image.includes('wikipedia')) {
              currentContributions[idx].image = seed.image;
            }
          }
        });

        // 3. Intentar obtener lugares del SERVIDOR
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const response = await fetch(`${API_BASE_URL}/api/places`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (response.ok) {
            const serverPlaces = await response.json();
            serverPlaces.forEach(sp => {
              const idx = currentContributions.findIndex(p => p && p.id === sp.id);
              if (idx === -1) currentContributions.push(sp);
            });
          }
        } catch (e) {}

        // 4. Limpieza final de duplicados y ordenación
        const uniqueContributions = [];
        const seen = new Set();
        const sortedContributions = currentContributions.sort((a, b) => {
          if (!a || !b) return 0;
          const aHasImg = a.image && !a.image.includes('http');
          const bHasImg = b.image && !b.image.includes('http');
          return (aHasImg === bHasImg) ? 0 : aHasImg ? -1 : 1;
        });

        sortedContributions.forEach(p => {
          if (!p) return;
          const key = `${(p.name || '').toLowerCase().trim()}-${(p.city || p.cityName || '').toLowerCase().trim()}`;
          if (!seen.has(key) && key !== '-') {
            seen.add(key);
            uniqueContributions.push(p);
          }
        });

        setUserData({ ...parsed, contributions: uniqueContributions });
      } catch (e) {
        console.error('Error cargando datos:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);



  const saveData = async (data) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const updateUserData = (arg1, arg2) => {
    setUserData(prev => {
      let updated;
      if (typeof arg1 === 'string' && typeof arg2 === 'function') {
        // Soporte para updateUserData('key', (prevVal) => newVal)
        updated = { ...prev, [arg1]: arg2(prev[arg1]) };
      } else if (typeof arg1 === 'object' && arg1 !== null) {
        // Soporte para updateUserData({ key: value })
        updated = { ...prev, ...arg1 };
      } else {
        return prev;
      }
      saveData(updated);
      return updated;
    });
  };

  const awardExperience = (amount, reason) => {
    setUserData(prev => {
      const newXP = prev.experience + amount;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      const levelledUp = newLevel > prev.level;
      
      let newBadges = [...(prev.badges || [])];
      let newTitles = [...(prev.unlockedTitles || [])];

      // Lógica de Insignias Automáticas
      if (prev.verifiedPlaces?.length >= 5 && !newBadges.includes('accessibility-hero')) {
        newBadges.push('accessibility-hero');
        newTitles.push('Héroe de la Accesibilidad');
      }
      
      const alicanteVisits = prev.visitedPlaces?.filter(id => id.includes('alicante'))?.length || 0;
      if (alicanteVisits >= 3 && !newBadges.includes('alicante-ambassador')) {
        newBadges.push('alicante-ambassador');
        newTitles.push('Embajador de Alicante');
      }

      if (prev.totalSavings >= 50 && !newBadges.includes('master-saver')) {
        newBadges.push('master-saver');
        newTitles.push('Maestro del Ahorro');
      }

      const updated = { 
        ...prev, 
        experience: newXP, 
        level: newLevel,
        badges: newBadges,
        unlockedTitles: newTitles
      };
      
      if (levelledUp) {
        Alert.alert('¡NIVEL UP!', `¡Has alcanzado el Nivel ${newLevel}! Sigue explorando para desbloquear más ventajas.`);
      }

      saveData(updated);
      return updated;
    });
  };

  /**
   * Persiste una imagen en el almacenamiento local permanente de la aplicación.
   * @param {string} uri URI temporal de la imagen (ej: de ImagePicker)
   * @param {string} filename Nombre del archivo para guardar
   * @returns {Promise<string>} La nueva URI permanente
   */
  const persistImage = async (uri, filename) => {
    if (!uri || (!uri.startsWith('file://') && !uri.startsWith('content://'))) return uri;
    
    try {
      // Verificar si el sistema de archivos está disponible (evita errores en Web)
      if (!documentDirectory) {
        console.warn('FileSystem: documentDirectory no disponible. Saltando persistencia local.');
        return uri;
      }

      const imgDir = `${documentDirectory}images/`;
      const dirInfo = await getInfoAsync(imgDir);
      
      if (!dirInfo.exists) {
        await makeDirectoryAsync(imgDir, { intermediates: true });
      }

      const fileExtension = uri.split('.').pop() || 'jpg';
      const permanentUri = `${imgDir}${filename}_${Date.now()}.${fileExtension}`;
      
      await copyAsync({
        from: uri,
        to: permanentUri
      });
      
      console.log('Imagen persistida en:', permanentUri);
      return permanentUri;
    } catch (error) {
      console.error('Error al persistir imagen:', error);
      return uri; // Fallback a la original si falla
    }
  };

  /**
   * Sube una imagen al servidor central.
   * @param {string} uri URI local de la imagen
   * @returns {Promise<string|null>} URL pública en el servidor o null si falla
   */
  const uploadImageToServer = async (uri) => {
    if (!uri) return null;
    
    try {
      // Intentar obtener la IP del host de Expo para el entorno de desarrollo
      // En producción esto sería una URL fija
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', { uri, name: filename, type });

      // TODO: Configurar la URL real del servidor. 
      // Por ahora usamos la IP pública detectada para pruebas
      const SERVER_URL = API_BASE_URL;

      const response = await fetch(`${SERVER_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        console.log('Imagen subida al servidor:', result.url);
        return `${SERVER_URL}${result.url}`;
      }
      return null;
    } catch (error) {
      console.error('Error al subir imagen al servidor:', error);
      return null;
    }
  };

  /**
   * Obtiene la lista de lugares compartidos por otros usuarios.
   */
  const fetchPlacesFromServer = async () => {
    try {
      const SERVER_URL = API_BASE_URL;
      const response = await fetch(`${SERVER_URL}/api/places`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener lugares del servidor:', error);
      return [];
    }
  };

  const logout = async () => {
    try {
      const loggedOutData = { ...userData, isLoggedIn: false };
      setUserData(loggedOutData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedOutData));
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      updateUserData, 
      awardExperience,
      persistImage,
      uploadImageToServer,
      fetchPlacesFromServer,
      logout, 
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de un UserProvider');
  return context;
};
