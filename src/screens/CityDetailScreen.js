import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Speech from 'expo-speech';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { GeminiService } from '../utils/gemini';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Info, 
  Accessibility, 
  Ticket,
  Cloud,
  History as HistoryIcon,
  Globe,
  Mountain,
  CheckCircle,
  X,
  Edit,
  Trash2,
  ChevronRight,
  Plus,
  Bus,
  Zap,
  Car,
  Utensils,
  PartyPopper,
  Train,
  Plane,
  Sparkles,
  TrendingDown,
  Users,
  TriangleAlert,
  Bath,
  ShieldCheck,
  PlusCircle,
  Sun,
  Moon,
  CloudRain,
  Thermometer,
  Wind,
  MessageCircle,
  MessageSquare,
  Gift,
  HandHelping,
  Flag,
  Volume2,
  VolumeX
} from 'lucide-react-native';
import { MONUMENTOS } from '../data/monumentos';
import { CIUDADES_PREMIUM } from '../data/ciudades';
import { typography } from '../theme/typography';
import { calculatePlaceSavings } from '../utils/savings';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config/api';

import * as Location from 'expo-location';
import { AutonomousCommunityMap } from '../components/AutonomousCommunityMap';
import { PROVINCE_TO_REGION } from '../data/provinces';
import { getFiestaPatronal } from '../data/fiestasPatronales';
import { getPoblacion } from '../data/poblacion';
import { REAL_CITY_DATA } from '../data/municipiosIA';
import { API_ENDPOINTS } from '../config/api';

const { width, height } = Dimensions.get('window');

const InfoModal = ({ visible, onClose, title, content, theme, icon: Icon }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <View style={[styles.modalIconBox, { backgroundColor: theme.primary + '20' }]}>
              <Icon color={theme.primary} size={24} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }, typography.h2]}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={theme.text} size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          {content.split('\n\n').map((paragraph, idx) => (
            <Text key={idx} style={[styles.modalText, { color: theme.textSecondary }]}>
              {paragraph.trim()}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);


export function CityDetailScreen({ route, navigation }) {
  const { city } = route.params;
  const { theme } = useTheme();
  const { userData, updateUserData, uploadImageToServer } = useUser();
  const isAdmin = userData?.isAdmin || false;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: '', icon: Info });
  const [cityCoords, setCityCoords] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Helper para el estado del lugar (Sincronizado con PlaceDetail)
  const getPlaceStatus = (p) => {
    if (!p) return { text: 'Cerrado', color: '#E74C3C' };
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const nowMin = hour * 60 + minutes;

    const parseTime = (timeStr) => {
      if (!timeStr || !timeStr.includes(':')) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const formatRemaining = (closeMin, nowMin) => {
      const diff = closeMin - nowMin;
      if (diff < 60) return `Cierra en ${diff} min`;
      const hours = Math.floor(diff / 60);
      return `Cierra en ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    };

    if (p.structuredSchedules && p.structuredSchedules.length > 0) {
      const season = p.structuredSchedules.find(s => {
        if (s.startDate && s.endDate) {
          const currentYear = now.getFullYear();
          const startParts = s.startDate.split('-');
          const endParts = s.endDate.split('-');
          
          const start = new Date(currentYear, parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0);
          const end = new Date(currentYear, parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59);
          
          if (start <= end) {
            return now >= start && now <= end;
          } else {
            const nextYearEnd = new Date(currentYear + 1, parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59);
            const prevYearStart = new Date(currentYear - 1, parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0);
            return (now >= start && now <= nextYearEnd) || (now >= prevYearStart && now <= end);
          }
        }
        const sM = parseInt(s.startMonth);
        const eM = parseInt(s.endMonth);
        if (!isNaN(sM) && !isNaN(eM)) {
          if (sM <= eM) return currentMonth >= sM && currentMonth <= eM;
          return currentMonth >= sM || currentMonth <= eM;
        }
        return false;
      });

      if (season && season.days) {
        const d = season.days[dayOfWeek];
        const mO = parseTime(d?.mOpen);
        const mC = parseTime(d?.mClose);
        const aO = parseTime(d?.aOpen);
        const aC = parseTime(d?.aClose);

        if (d && d.isOpen) {
          if (mO !== null && mC !== null && nowMin >= mO && nowMin < mC) return { text: `Abierto • ${formatRemaining(mC, nowMin)}`, color: '#2ECC71' };
          if (aO !== null && aC !== null && nowMin >= aO && nowMin < aC) return { text: `Abierto • ${formatRemaining(aC, nowMin)}`, color: '#2ECC71' };
          if (mO !== null && nowMin < mO) return { text: `Cerrado • Abre hoy a las ${d.mOpen}`, color: '#E74C3C' };
          if (aO !== null && nowMin < aO) return { text: `Cerrado • Abre hoy a las ${d.aOpen}`, color: '#E74C3C' };
        }

        let nextDay = (dayOfWeek + 1) % 7;
        const nextD = season.days[nextDay];
        if (nextD && nextD.isOpen) {
          return { text: `Cerrado • Abre mañana a las ${nextD.mOpen || '10:00'}`, color: '#E74C3C' };
        }
        return { text: 'Cerrado', color: '#E74C3C' };
      }
    }

    const schedule = (p.schedule || "").toLowerCase();
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    if (schedule.includes(`${days[dayOfWeek]}: cerrado`)) return { text: 'Cerrado', color: '#E74C3C' };
    return { text: 'Ver horario', color: theme.primary };
  };

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [serverPlaces, setServerPlaces] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const normalize = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().trim()
      .split('/')[0].split('(')[0].trim() // Quedarse solo con la primera parte (ej: "Alicante/Alacant" -> "alicante")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i')
      .replace(/[^a-z0-9]/g, ''); // Eliminar cualquier otro caracter especial
  };

  const cityKey = normalize(city.name);
  const customData = userData?.customCityData?.[cityKey] || {};
  const premiumMatch = Object.entries(CIUDADES_PREMIUM).find(([name]) => normalize(name) === cityKey)?.[1] || {};

  const [tempCityData, setTempCityData] = useState({
    ...city,
    ...premiumMatch,
    ...customData
  });

  // Cargar datos del servidor
  useEffect(() => {
    const fetchLatestCityData = async () => {
      if (!city.id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/municipalities/${city.id}`);
        if (response.ok) {
          const latest = await response.json();
          setTempCityData(prev => ({ ...prev, ...latest }));
        }
      } catch (err) {
        console.warn("Error sincronizando ciudad con servidor:", err);
      }
    };
    fetchLatestCityData();
  }, [city.id]);

  // Cargar datos extendidos del servidor
  useEffect(() => {
    const fetchCityDetails = async () => {
      // Si ya tenemos historia y geografía (Premium), no hace falta fetch
      if (tempCityData.history && tempCityData.geography) return;
      if (!city.id) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      setIsLoadingDetails(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.MUNICIPALITIES}/${city.id}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const detailedCity = await response.json();
          setTempCityData(prev => ({
            ...prev,
            ...detailedCity,
            name: detailedCity.name || prev.name,
            population: detailedCity.population || prev.population,
            fiesta: detailedCity.fiesta || prev.fiesta
          }));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching city details:', error);
        }
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchCityDetails();
  }, [city.id]);

  // Cargar lugares de esta ciudad desde el servidor
  useEffect(() => {
    const fetchCityPlaces = async () => {
      const cityName = tempCityData.name || city.name;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`${API_ENDPOINTS.PLACES}?city=${encodeURIComponent(cityName)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const mapped = data.map(p => ({
              ...p.extra_data,
              ...p,
              isPlace: true
            }));
            setServerPlaces(mapped);
          } else {
            // Fallback si el servidor no tiene lugares para esta ciudad
            loadLocalPlacesFallback(cityName);
          }
        } else {
          loadLocalPlacesFallback(cityName);
        }
      } catch (error) {
        // Silenciar errores de red/timeout ya que tenemos fallback
        loadLocalPlacesFallback(cityName);
      }
    };

    const loadLocalPlacesFallback = (cityName) => {
      const normCity = normalize(cityName);
      // MONUMENTOS es un objeto donde las llaves son nombres de ciudades
      const matchingKey = Object.keys(MONUMENTOS).find(k => normalize(k) === normCity);
      const localMatches = MONUMENTOS[matchingKey] || [];
      setServerPlaces(localMatches);
    };

    fetchCityPlaces();
  }, [tempCityData.name, city.name]);


  // Determinar la región si falta
  const effectiveRegion = useMemo(() => {
    const name = (tempCityData.name || city.name || '').toLowerCase();
    const prov = (tempCityData.province || '').toLowerCase();
    if (name.includes('alicante') || prov.includes('alicante')) return 'Valencia';
    return PROVINCE_TO_REGION[tempCityData.province] || tempCityData.province || 'Comunidad Valenciana';
  }, [tempCityData.province, tempCityData.name, city.name]);

  // Audio Guía Logic
  const toggleSpeech = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const textToSpeak = tempCityData.description || `Bienvenido a ${tempCityData.name || city.name}. Ciudad rica en historia y cultura.`;
      setIsSpeaking(true);
      Speech.speak(textToSpeak, {
        language: 'es',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  // Geocodificar la ciudad para el mapa
  useEffect(() => {
    const getCoords = async () => {
      try {
        const result = await Location.geocodeAsync(`${city.name}, Spain`);
        if (result && result.length > 0) {
          setCityCoords({
            latitude: result[0].latitude,
            longitude: result[0].longitude
          });
        }
      } catch (e) {
        console.log("Error geocoding city:", e);
      }
    };
    getCoords();
  }, [city.name]);

  const fiestaData = useMemo(() => {
    if (tempCityData.fiesta) {
      return { 
        fiesta: tempCityData.fiesta, 
        fecha: tempCityData.fiesta_date || 'Consulta calendario local' 
      };
    }
    return getFiestaPatronal(tempCityData.name || city.name);
  }, [tempCityData.name, tempCityData.fiesta, tempCityData.fiesta_date, city.name]);

  const poblacion = useMemo(() => getPoblacion(tempCityData.name), [tempCityData.name]);

  // Sincronizar tempCityData con userData cuando cambie
  useEffect(() => {
    if (!isAdmin) return; // Solo los admins persisten cambios en ciudades oficiales
    
    const persistChanges = async () => {
      const cityKey = normalize(tempCityData.name || city.name);
      updateUserData('customCityData', (prev) => ({
        ...(prev || {}),
        [cityKey]: {
          image: tempCityData.image,
          history: tempCityData.history,
          climate: tempCityData.climate,
          geography: tempCityData.geography,
          landscape: tempCityData.landscape,
          gastronomy: tempCityData.gastronomy,
          festivities: tempCityData.festivities,
          transports: tempCityData.transports,
          lastUpdated: new Date().toISOString()
        }
      }));
    };
    
    const hasChanges = 
      tempCityData.image !== (customData.image || city.image) ||
      tempCityData.history !== (customData.history || city.history) ||
      tempCityData.climate !== (customData.climate || city.climate) ||
      tempCityData.geography !== (customData.geography || city.geography) ||
      tempCityData.landscape !== (customData.landscape || city.landscape) ||
      tempCityData.gastronomy !== (customData.gastronomy || city.gastronomy) ||
      tempCityData.festivities !== (customData.festivities || city.festivities) ||
      JSON.stringify(tempCityData.transports) !== JSON.stringify(customData.transports || city.transports);

    if (hasChanges) {
      persistChanges();
    }
  }, [tempCityData, isAdmin, customData, city, updateUserData]);

  const officialPlaces = useMemo(() => {
    const cName = normalize(city.name);
    // Buscar coincidencia exacta o parcial normalizada
    const matchingKey = Object.keys(MONUMENTOS).find(k => normalize(k) === cName);
    return MONUMENTOS[matchingKey] || [];
  }, [city.name]);

  const userContributions = (userData?.contributions || []).filter(p => {
    const pCity = normalize(p.city);
    const cName = normalize(city.name);
    return pCity === cName;
  }).map(p => ({
    ...p,
    description: p.freeInfo || 'Lugar añadido por la comunidad.',
    category: p.category,
    tariffs: p.tariffs,
    isUserAdded: true,
    verified: p.verified || false,
    userId: p.userId
  }));

  // MEZCLA INTELIGENTE: Priorizar versiones del usuario visibles
  const visibleUserContributions = (userContributions || []).filter(p => 
    isAdmin || p.verified || p.userId === userData?.id
  );
  
  const allPlaces = useMemo(() => {
    const combined = [
      ...visibleUserContributions,
      ...serverPlaces,
      ...officialPlaces
    ];
    
    const seen = new Set();
    const unique = [];
    
    combined.forEach(p => {
      // Usar un identificador compuesto para garantizar unicidad absoluta
      const pId = p.id || p._id || `temp-${p.name}`;
      const key = `${pId}-${normalize(p.name)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ ...p, compositeKey: key });
      }
    });
    
    return unique;
  }, [visibleUserContributions, serverPlaces, officialPlaces]);

  const handleValidate = async (placeId) => {
    const updatedContributions = userData.contributions.map(p => 
      p.id === placeId ? { ...p, verified: true } : p
    );
    await updateUserData({ contributions: updatedContributions });
    Alert.alert("¡Validado!", "El lugar ahora es visible para todos los usuarios.");
  };

  const handleUnvalidate = async (placeId) => {
    const updatedContributions = userData.contributions.map(p => 
      p.id === placeId ? { ...p, verified: false } : p
    );
    await updateUserData({ contributions: updatedContributions });
    Alert.alert("Des-verificado", "El lugar ha vuelto a estado pendiente.");
  };

  const handleDeleteContribution = async () => {
    Alert.alert(
      "Eliminar Ciudad",
      "¿Estás seguro de que quieres eliminar esta ciudad de las contribuciones?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            const updatedContributions = userData.contributions.filter(p => 
              normalize(p.city) !== cityKey
            );
            await updateUserData({ contributions: updatedContributions });
            navigation.goBack();
            Alert.alert("Eliminado", "La ciudad ha sido eliminada de las contribuciones.");
          }
        }
      ]
    );
  };

  const openInfo = (title, content, icon) => {
    setModalData({ title, content, icon });
    setModalVisible(true);
  };

  const pickHeaderImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setTempCityData(prev => ({ ...prev, image: newImage }));
      
      const cityName = displayCityData.name || city.name;
      const cityKey = normalize(cityName);

      // 1. Intentar subir al servidor si somos admin
      if (isAdmin) {
        try {
          const publicUrl = await uploadImageToServer(newImage);
          if (publicUrl) {
            let targetId = tempCityData.id || city.id;
            
            // Si no tenemos ID, lo buscamos en el servidor por nombre
            if (!targetId) {
              const findRes = await fetch(`${API_BASE_URL}/api/municipalities?search=${encodeURIComponent(cityName)}&limit=1`);
              if (findRes.ok) {
                const found = await findRes.json();
                if (found && found.length > 0) targetId = found[0].id;
              }
            }

            if (targetId) {
              console.log(`[CLIENT] Patching city ${targetId} with ${publicUrl}`);
              await fetch(`${API_BASE_URL}/api/municipalities/${targetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: publicUrl })
              });
              console.log("Imagen oficial de ciudad actualizada en servidor");
            }
          }
        } catch (err) {
          console.warn("Error subiendo imagen oficial al servidor:", err);
        }
      }
      
      // 2. Persistir en perfil local (fallback y personalización)
      updateUserData('customCityData', (prevData) => {
        const current = prevData || {};
        return {
          ...current,
          [cityKey]: {
            ...(current[cityKey] || {}),
            image: newImage,
            lastUpdate: new Date().toISOString()
          }
        };
      });
      
      Alert.alert("¡Imagen actualizada!", "La foto se ha guardado correctamente.");
    }
  };

  const handleEditContent = (section, currentText) => {
    Alert.prompt(
      `Editar ${section}`,
      "Introduce el nuevo contenido oficial:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Guardar", 
          onPress: (newText) => {
            const fieldMap = {
              'Historia': 'history',
              'Geografía': 'geography',
              'Clima': 'climate',
              'Paisaje': 'landscape',
              'Gastronomía': 'gastronomy',
              'Festividades': 'festivities'
            };
            setTempCityData(prev => ({ ...prev, [fieldMap[section]]: newText }));
            Alert.alert("Éxito", "Cambios guardados permanentemente.");
          }
        }
      ],
      'plain-text',
      currentText
    );
  };

  const handleAdminEdit = (section, currentText) => {
    if (section === 'Cabecera') {
      Alert.alert(
        "Administración",
        "¿Deseas cambiar la foto oficial?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir Galería", onPress: pickHeaderImage }
        ]
      );
    } else {
      Alert.alert(
        "Administración",
        `¿Deseas editar ${section}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Editar Texto", onPress: () => handleEditContent(section, currentText) }
        ]
      );
    }
  };

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.spring(menuAnim, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Capa de visualización prioritaria
  const displayCityData = useMemo(() => {
    return aiResults ? { ...tempCityData, ...aiResults } : tempCityData;
  }, [tempCityData, aiResults]);

  // Datos de contexto (Simulados para el Store)
  const cityContextData = React.useMemo(() => {
    const name = tempCityData.name || city.name;
    // Priorizar población real de INE si los datos actuales son genéricos o faltan
    let popRaw = tempCityData.population;
    if (!popRaw || popRaw.includes('censo') || popRaw.includes('habitantes')) {
      popRaw = getPoblacion(name);
    }
    
    const popFormatted = popRaw.toString().replace(' hab.', '').replace(' (aprox.)', '');
    return { pop: popFormatted, temp: '22°C', status: 'sunny' };
  }, [tempCityData.name, tempCityData.population, city.name]);


  const renderWeatherIcon = (status, size = 16, color = "#FFF") => {
    switch (status) {
      case 'sunny': return <Sun color={color} size={size} />;
      case 'cloudy': return <Cloud color={color} size={size} />;
      case 'rainy': return <CloudRain color={color} size={size} />;
      case 'night': return <Moon color={color} size={size} />;
      default: return <Sun color={color} size={size} />;
    }
  };

  const handleAiEnhance = async () => {
    Keyboard.dismiss();
    const hasGemini = userData?.aiApiKey && userData.aiApiKey.length > 10;
    setIsAiProcessing(true);
    const cityName = displayCityData.name || city.name || 'esta ciudad';
    const cityKey = normalize(cityName);
    setAiProgress(0.1);

    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 0.9) return prev;
        return prev + (0.9 - prev) * 0.15;
      });
    }, 500);

    const finishProcessing = (content, isReal) => {
      clearInterval(progressInterval);
      setAiProgress(1);
      setTimeout(() => {
        applyAiCityResults(content, isReal);
        setAiProgress(0);
      }, 600);
    };
    // Usar el servicio unificado con fallback local interno
    try {
      const userKey = userData?.aiApiKey || null;
      const openKey = userData?.openaiApiKey || null;
      const aiContent = await GeminiService.getCityData(cityName, userKey, openKey);
      if (aiContent) {
        finishProcessing(aiContent, !aiContent.isMock);
        if (aiContent.isMock) {
          const detail = GeminiService.lastError ? `\n\nMotivo: ${GeminiService.lastError}` : '';
          Alert.alert("Sugerencia Local", `Usando base de datos interna.${detail}`);
        }
        return;
      }
    } catch (error) {
      console.log("[IA] Error silencioso capturado:", error.message);
      // Fallback automático sin molestar al usuario
    } finally {
      setIsAiProcessing(false);
      setAiProgress(0);
      clearInterval(progressInterval);
    }

    // El servicio ya devuelve mockData enriquecida si falla la IA
    finishProcessing(aiContent, !!(aiContent && !aiContent.isMock));
  };

  const applyAiCityResults = (aiContent, isRealGemini) => {
    const cityName = displayCityData.name || city.name;
    const cityKey = normalize(cityName);

    setAiResults(aiContent);
    setIsAiProcessing(false);
    setIsAiEnhanced(true);

    // 1. Actualizamos localmente
    setTempCityData(prev => ({ ...prev, ...aiContent }));

    // 2. Guardamos permanentemente en el perfil
    updateUserData('customCityData', (prevData) => {
      const current = prevData || {};
      return {
        ...current,
        [cityKey]: {
          ...(current[cityKey] || {}),
          ...aiContent,
          isAiEnhanced: true,
          lastUpdate: new Date().toISOString()
        }
      };
    });

    setTimeout(() => {
      Alert.alert(
        isRealGemini ? "🚀 MOTOR GEMINI PRO 1.5: MUNICIPIOS" : "✨ IA DISTRAVEL ACTIVADA",
        `Investigación cultural completada para ${cityName}.\n\nSe han actualizado la historia, geografía, clima, paisaje, gastronomía y festividades de forma permanente.`
      );
    }, 100);
  };



  const introSection = (
    <View style={styles.introSection}>
      {!isAiProcessing && (
        <View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {displayCityData.description || `Explora los lugares accesibles de ${displayCityData.name}.`}
          </Text>
          <TouchableOpacity onPress={() => openInfo('Descripción Completa', displayCityData.description, Info)}>
            <Text style={[styles.readMore, { color: theme.primary }]}>Leer más</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BOTÓN IA ELITE - SOLO ADMIN */}
      {isAdmin && (
        <TouchableOpacity 
          style={[
            styles.aiButton, 
            isAiEnhanced && styles.aiButtonActive,
            userData.aiApiKey && { backgroundColor: '#8E44AD' }
          ]} 
          onPress={handleAiEnhance}
          disabled={isAiProcessing}
        >
          {isAiProcessing ? (
            <Zap color="#FFF" size={20} />
          ) : (
            userData.aiApiKey ? <Sparkles color="#FFF" size={20} fill={isAiEnhanced ? "#FFF" : "transparent"} /> : <Zap color="#FFF" size={20} fill={isAiEnhanced ? "#FFF" : "transparent"} />
          )}
          <Text style={styles.aiButtonText}>
            {isAiProcessing 
              ? (userData.aiApiKey ? "Analizando Destino..." : "Procesando con IA...") 
              : isAiEnhanced 
                ? (userData.aiApiKey ? "Investigación Activa" : "Experiencia Aumentada con IA") 
                : (userData.aiApiKey ? "Potenciar Investigación" : "Aumentar experiencia con IA")}
          </Text>
          {!isAiProcessing && !isAiEnhanced && (
            <View style={[styles.aiBadge, userData.aiApiKey && { backgroundColor: '#FFF' }]}>
              <Text style={[styles.aiBadgeText, userData.aiApiKey && { color: '#8E44AD' }]}>
                {userData.aiApiKey ? "GEMINI" : "PRO"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: displayCityData.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay} />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>

          {/* Botón de edición siempre visible para pruebas de diseño */}
          <View style={styles.adminHeaderActions}>
            <TouchableOpacity 
              style={[styles.backButton, { position: 'relative', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.6)' }]}
              onPress={pickHeaderImage}
            >
              <Edit color="#FFFFFF" size={22} />
            </TouchableOpacity>
          </View>

          {/* CAPA 1: MAPA REGIONAL (DESPLAZADO A LA DERECHA) */}
          <View style={{ 
            position: 'absolute', 
            top: '25%', 
            right: -20, // Desplazado a la derecha
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1,
            opacity: 0.8
          }}>
            <AutonomousCommunityMap 
              regionName={effectiveRegion} 
              cityCoords={displayCityData.coords || cityCoords}
              width={200}
              height={160}
            />
          </View>

          <View style={styles.heroContent}>
            {/* City Name inside Hero - Capa superior */}
            <Text style={styles.heroCityNameInside}>
              {displayCityData.name}
            </Text>

            {/* City Context Bar (Weather & Stats) */}
            <View style={styles.contextBar}>
              <View style={styles.contextItem}>
                <Users color="#FFFFFF" size={16} />
                <Text style={[styles.contextText, { fontSize: 14 }]}>{cityContextData.pop} habitantes</Text>
              </View>
              
              <View style={[styles.contextDivider, { height: 20, backgroundColor: 'rgba(255,255,255,0.4)' }]} />
              
              <View style={styles.contextItem}>
                {renderWeatherIcon(cityContextData.status, 18, "#F1C40F")}
                <Text style={[styles.contextText, { fontSize: 14 }]}>{cityContextData.temp}</Text>
              </View>
            </View>
          </View>

        </View>

        <View style={[styles.locationBar, { backgroundColor: '#EFBF04' }]}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}
            onPress={() => navigation.navigate('Map', { city: displayCityData })}
          >
            <MapPin color="#0A192F" size={18} />
            <Text style={styles.locationBarText}>
              {(displayCityData.province || 'ALICANTE').toUpperCase()} / <Text style={{ fontWeight: '800' }}>MAPA</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(10, 25, 47, 0.15)', marginHorizontal: 12 }} />
          
          <TouchableOpacity 
            onPress={toggleSpeech}
            style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }}
          >
            {isSpeaking ? <VolumeX color="#0A192F" size={20} /> : <Volume2 color="#0A192F" size={20} />}
            <Text style={{ color: '#0A192F', fontWeight: '800', fontSize: 11, marginLeft: 6 }}>AUDIO</Text>
          </TouchableOpacity>
        </View>

        {/* FIESTAS PATRONALES STRIP */}
        <View style={[styles.fiestaBar, { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
          <View style={[styles.fiestaIconBox, { backgroundColor: theme.primary + '15' }]}>
            <PartyPopper color={theme.primary} size={18} />
          </View>
          <View style={styles.fiestaContent}>
            <Text style={[styles.fiestaLabel, { color: theme.textSecondary }]}>Fiestas Patronales</Text>
            <Text style={[styles.fiestaName, { color: theme.text }]}>
              {fiestaData.fiesta} <Text style={{ color: theme.primary, fontWeight: '700' }}>• {fiestaData.fecha}</Text>
            </Text>
          </View>
          <View style={styles.fiestaBadge}>
            <Sparkles color="#F1C40F" size={12} fill="#F1C40F" />
            <Text style={styles.fiestaBadgeText}>TRADICIÓN</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Main Description & AI Button */}
          {introSection}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Accessibility color={theme.primary} size={22} />
              <Text style={[styles.statValue, { color: theme.text }]}>95%</Text>
              <Text style={styles.statLabel}>Adaptado</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ticket color="#F1C40F" size={22} />
              <Text style={[styles.statValue, { color: theme.text }]}>Gratis</Text>
              <Text style={styles.statLabel}>PCD</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <CheckCircle color="#2ECC71" size={22} />
              <Text style={[styles.statValue, { color: theme.text }]}>{allPlaces.length}</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => navigation.navigate('DistravelAI')}
            >
              <Sparkles color={theme.primary} size={20} />
              <Text style={[styles.quickActionText, { color: theme.text }]}>Asistente IA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => navigation.navigate('Social')}
            >
              <MessageCircle color={theme.primary} size={20} />
              <Text style={[styles.quickActionText, { color: theme.text }]}>Comunidad</Text>
            </TouchableOpacity>
          </View>

          {/* Grid Cards */}
          <View style={styles.grid}>
            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Nuestra Historia', displayCityData.history || 'Ciudad histórica.', HistoryIcon)}
              onLongPress={() => isAdmin && handleAdminEdit('Historia', displayCityData.history)}
            >
              <HistoryIcon color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Historia</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Geografía Local', displayCityData.geography || 'Ubicación estratégica.', Globe)}
              onLongPress={() => isAdmin && handleAdminEdit('Geografía', displayCityData.geography)}
            >
              <Globe color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Geografía</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Climatología', displayCityData.climate || 'Clima mediterráneo.', Cloud)}
              onLongPress={() => isAdmin && handleAdminEdit('Clima', displayCityData.climate)}
            >
              <Cloud color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Clima</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Entorno y Paisaje', displayCityData.landscape || 'Entorno privilegiado.', Mountain)}
              onLongPress={() => isAdmin && handleAdminEdit('Paisaje', displayCityData.landscape)}
            >
              <Mountain color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Paisaje</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Gastronomía', displayCityData.gastronomy || 'Gastronomía rica y variada.', Utensils)}
              onLongPress={() => isAdmin && handleAdminEdit('Gastronomía', displayCityData.gastronomy)}
            >
              <Utensils color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Gastronomía</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Festividades', displayCityData.festivities || 'Calendario festivo y cultural.', PartyPopper)}
              onLongPress={() => isAdmin && handleAdminEdit('Festividades', displayCityData.festivities)}
            >
              <PartyPopper color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Festividades</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>
          </View>

          {/* Transporte Conectado v3.0 */}
          <View style={{ marginBottom: 35 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>
              Transporte Conectado
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {[
                { id: 'bus', title: 'Autobuses', icon: Bus, activeColor: theme.primary, activeText: '100% Accesible' },
                { id: 'taxi', title: 'EuroTaxi', icon: Car, activeColor: '#3498DB', activeText: 'Disponible' },
                { id: 'tram', title: 'TRAM / Metro', icon: Zap, activeColor: '#F1C40F', activeText: 'Rampa Auto' },
                { id: 'train', title: 'Tren', icon: Train, activeColor: '#9B59B6', activeText: 'Adaptado' },
                { id: 'plane', title: 'Aeropuerto', icon: Plane, activeColor: '#E74C3C', activeText: 'Asistencia PMR' }
              ].map((transport) => {
                // Si la IA ha devuelto transports, los usamos. Si no, por defecto mostramos bus y taxi (para evitar que salga todo activo al entrar).
                const isActive = displayCityData.transports 
                  ? displayCityData.transports[transport.id] 
                  : ['bus', 'taxi'].includes(transport.id); // Valor por defecto antes de usar IA

                const Icon = transport.icon;

                return (
                  <View key={transport.id} style={[styles.transportCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: isActive ? 1 : 0.4 }]}>
                     <Icon color={isActive ? transport.activeColor : theme.textSecondary} size={24} />
                     <Text style={[styles.transportTitle, { color: isActive ? theme.text : theme.textSecondary }]}>{transport.title}</Text>
                     <View style={styles.transportStatus}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#2ECC71' : '#7F8C8D' }]} />
                        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                          {isActive ? transport.activeText : 'No Disponible'}
                        </Text>
                     </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* SECCIÓN DE AYUDA Y OFERTAS PCD */}
          <View style={{ marginBottom: 35 }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 5 }]}>
                Ayuda en tu Viaje: Ofertas PCD
              </Text>
              <Gift color={theme.primary} size={22} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 15, fontStyle: 'italic' }}>
              Descubre lugares con los mejores beneficios para tu grado de discapacidad en {displayCityData.name || city.name || 'esta ciudad'}.
            </Text>
            
            <View style={[styles.offerBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
              <HandHelping color={theme.primary} size={24} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.offerTitle, { color: theme.text }]}>¿Sabías que...?</Text>
                <Text style={[styles.offerDesc, { color: theme.textSecondary }]}>
                  En la mayoría de museos de {displayCityData.name || city.name || 'esta ciudad'}, si tienes un grado de discapacidad mayor al 33%, la entrada suele ser gratuita para ti y un acompañante. ¡Aprovecha estos beneficios!
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.surface, marginTop: 15 }]}
              onPress={() => navigation.navigate('Map', { city })}
            >
              <Zap color="#F1C40F" size={24} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.actionCardTitle, { color: theme.text }]}>Ver Mapa de Beneficios</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Identifica por colores los sitios gratis (Verde) y reducidos (Azul).</Text>
              </View>
              <ChevronRight color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 20, paddingRight: 20 }}
          >
            {allPlaces.map((place, index) => {
              const savings = calculatePlaceSavings(place);
              const status = getPlaceStatus(place);
              const isAiEnhanced = place.aiContent || (userData.contributions && userData.contributions.find(c => c.id === place.id && c.aiContent));

              return (
                <TouchableOpacity 
                  key={place.compositeKey || `place-${index}-${place.id}`} 
                  style={[styles.placeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('PlaceDetail', { place })}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: place.image || 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4' }} 
                    style={styles.placeCardImage} 
                  />
                  <View style={styles.placeCardOverlay} />
                  
                  <View style={styles.placeCardBadge}>
                    <Accessibility color="#FFF" size={12} />
                    <Text style={styles.placeCardBadgeText}>Adaptado</Text>
                  </View>

                  {savings && (
                    <View style={styles.savingsBadge}>
                      <TrendingDown color="#FFF" size={12} />
                      <Text style={styles.savingsBadgeText}>Ahorras {savings}€</Text>
                    </View>
                  )}

                  <View style={[styles.listStatusBadge, { backgroundColor: status.color }]}>
                    <Clock color="#FFF" size={10} />
                    <Text style={styles.listStatusText}>{status.text}</Text>
                  </View>

                  {isAiEnhanced && (
                    <View style={styles.aiInsightBadge}>
                      <Zap color="#F1C40F" size={10} fill="#F1C40F" />
                      <Text style={styles.aiInsightText}>IA: Ruta Optimizada</Text>
                    </View>
                  )}

                  <View style={styles.placeCardContent}>
                    {isAiEnhanced && (
                      <Text style={styles.aiTipText}>
                        Tip IA: Mejor acceso a las 10:00 AM
                      </Text>
                    )}
                    <Text style={styles.placeCardName} numberOfLines={1}>{place.name}</Text>
                    {place.address && (
                      <Text style={styles.placeCardAddress} numberOfLines={1}>
                        <MapPin size={10} color="rgba(255,255,255,0.7)" /> {place.address}
                      </Text>
                    )}
                    <View style={styles.placeCardTag}>
                      <Text style={styles.placeCardTagText}>{place.category || 'Monumento'}</Text>
                    </View>
                  </View>

                  {isAdmin && place.isUserAdded && (
                    <TouchableOpacity 
                      style={[styles.adminBadgeAction, { backgroundColor: place.verified ? '#2ECC71' : '#FF9500' }]}
                      onPress={() => place.verified ? handleUnvalidate(place.id) : handleValidate(place.id)}
                    >
                      {place.verified ? <CheckCircle color="#FFF" size={14} /> : <Zap color="#FFF" size={14} />}
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Tarjeta de añadir lugar al final de la lista */}
            <TouchableOpacity 
              style={[
                styles.placeCard, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.primary, 
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20
                }
              ]}
              onPress={() => navigation.navigate('AddLocation', { defaultCity: tempCityData.name || city.name })}
            >
              <View style={{ backgroundColor: theme.primary + '20', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                <Plus color={theme.primary} size={28} />
              </View>
              <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14, textAlign: 'center' }}>¿Falta algo?</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 10, textAlign: 'center', marginTop: 5, paddingHorizontal: 10 }}>
                Añade un monumento
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Expandable FAB Menu */}
      <View style={styles.fabContainer}>
        {isMenuOpen && (
          <Animated.View style={[styles.expandedMenu, { opacity: menuOpacity, transform: [{ scale: menuScale }] }]}>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: '#FF3B30' }]} 
              onPress={() => { toggleMenu(); navigation.navigate('Emergency'); }}
            >
              <TriangleAlert color="#FFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: '#3498DB' }]} 
              onPress={() => { toggleMenu(); navigation.navigate('Toilets'); }}
            >
              <Bath color="#FFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: '#FF9500' }]} 
              onPress={() => { 
                toggleMenu(); 
                Alert.alert("Reportar Error", "¿Has encontrado información incorrecta sobre esta ciudad?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Reportar", onPress: () => Alert.alert("Enviado", "Gracias por ayudarnos a mantener Distravel actualizado.") }
                ]);
              }}
            >
              <Flag color="#FFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: theme.primary }]} 
              onPress={() => { toggleMenu(); navigation.navigate('AddLocation', { defaultCity: tempCityData.name || city.name }); }}
            >
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </Animated.View>
        )}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={toggleMenu}
        >
          <Animated.View style={{ transform: [{ rotate: menuAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>
            {isMenuOpen ? <X color="#FFF" size={32} /> : <PlusCircle color="#FFF" size={32} />}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isAiProcessing && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.surface, padding: 35, borderRadius: 30, alignItems: 'center', width: '85%', borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[typography.h2, { color: theme.text, marginTop: 25, textAlign: 'center', fontSize: 22 }]}>Análisis de Destino Inteligente</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center', fontStyle: 'italic', fontSize: 14, lineHeight: 20 }}>
              Realizando investigación enciclopédica sobre "{displayCityData.name}"...
            </Text>
            <View style={{ height: 6, width: '100%', backgroundColor: theme.border, borderRadius: 3, marginTop: 25, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${aiProgress * 100}%`, backgroundColor: theme.primary }} />
            </View>
            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '800', marginTop: 15, letterSpacing: 1 }}>
              {Math.round(aiProgress * 100)}% COMPLETADO
            </Text>
          </View>
        </View>
      )}

      <InfoModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalData.title}
        content={modalData.content}
        icon={modalData.icon}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { height: height * 0.45, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  backButton: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10 
  },
  heroContent: { 
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20
  },
  heroSeparator: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginVertical: 15
  },
  heroCityNameInside: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginTop: 10
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationBarText: {
    color: '#0A192F',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  fiestaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  fiestaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fiestaContent: {
    flex: 1,
  },
  fiestaLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  fiestaName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fiestaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  fiestaBadgeText: {
    color: '#F1C40F',
    fontSize: 9,
    fontWeight: '900',
  },
  adminHeaderActions: {
    position: 'absolute', 
    top: 50, 
    right: 20, 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999, // Superponer a todo
  },
  adminActionBtn: {
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mainContent: { padding: 25, paddingTop: 30 },
  introSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  aiButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: '100%',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  aiButtonActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  aiButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 10,
  },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  aiInsightBadge: {
    position: 'absolute',
    top: 45,
    left: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  aiInsightText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  aiTipText: {
    color: '#F1C40F',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
    marginBottom: 20,
    letterSpacing: 0.3
  },
  description: { 
    fontSize: 16, 
    lineHeight: 24, 
    textAlign: 'justify',
    marginBottom: 10 
  },
  readMore: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 15,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  statCard: { width: '30%', padding: 16, borderRadius: 24, alignItems: 'center', borderWidth: 1, elevation: 2, shadowOpacity: 0.05 },
  statValue: { fontSize: 20, fontWeight: '900', marginVertical: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 35 },
  infoCard: { width: '48%', padding: 22, borderRadius: 24, alignItems: 'center', marginBottom: 15, borderWidth: 1, position: 'relative' },
  infoCardTitle: { marginTop: 12, fontSize: 15, fontWeight: '700' },
  adminDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EFBF04' },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  sectionHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  adminAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  placeCard: {
    width: 220,
    height: 280,
    borderRadius: 24,
    marginRight: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  placeCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  placeCardBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  placeCardBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  savingsBadge: {
    position: 'absolute',
    top: 45,
    right: 12,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  savingsBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  placeCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  placeCardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  placeCardAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeCardTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  placeCardTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  adminBadgeAction: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { height: '75%', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { marginLeft: 15, flex: 1 },
  modalBody: { flex: 1 },
  modalText: { fontSize: 17, lineHeight: 28, textAlign: 'justify' },
  closeButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' },
  transportCard: {
    width: 140,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  transportTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  transportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contextText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  contextDivider: {
    width: 1,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastItem: {
    alignItems: 'center',
    gap: 2,
  },
  forecastLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  forecastTemp: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  fab: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  expandedMenu: {
    marginBottom: 15,
    gap: 12,
    alignItems: 'center',
  },
  miniFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
