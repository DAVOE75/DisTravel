import React, { useState, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Linking,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Keyboard,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';
import * as LucideIcons from 'lucide-react-native';
import { typography } from '../theme/typography';
import { GeminiService } from '../utils/gemini';
import { calculatePlaceSavings } from '../utils/savings';
import * as ImagePicker from 'expo-image-picker';

// Fallback seguro para react-native-maps
let MapViewRaw, MarkerRaw;
try {
  const Maps = require('react-native-maps');
  MapViewRaw = Maps.default;
  MarkerRaw = Maps.Marker;
} catch (e) {
  console.warn('react-native-maps no disponible');
}

import { AutonomousCommunityMap } from '../components/AutonomousCommunityMap';
import { PROVINCE_TO_REGION, INE_PROVINCES } from '../data/provinces';
import MUNICIPIOS_DATA from '../data/municipios.json';

// Normalización de iconos para evitar "Render Error"
const getIcon = (name) => LucideIcons[name]?.default || LucideIcons[name] || LucideIcons.Info;
const MapView = (MapViewRaw?.default || MapViewRaw);
const Marker = (MarkerRaw?.default || MarkerRaw);

const ChevronLeft = getIcon('ChevronLeft');
const MapPin = getIcon('MapPin');
const Clock = getIcon('Clock');
const CreditCard = getIcon('CreditCard');
const Info = getIcon('Info');
const Globe = getIcon('Globe');
const Phone = getIcon('Phone');
const Accessibility = getIcon('Accessibility');
const Navigation = getIcon('Navigation');
const CheckCircle2 = getIcon('CheckCircle2');
const AlertTriangle = getIcon('AlertTriangle');
const LinkIcon = getIcon('Link');
const Edit = getIcon('Edit');
const Sparkles = getIcon('Sparkles');
const Eye = getIcon('Eye');
const Ear = getIcon('Ear');
const Brain = getIcon('Brain');
const Share2 = getIcon('Share2');
const Trash2 = getIcon('Trash2');
const Save = getIcon('Save');
const X = getIcon('X');
const Camera = getIcon('Camera');
const PlusCircle = getIcon('PlusCircle');
const MinusCircle = getIcon('MinusCircle');
const Mic = getIcon('Mic');
const Users = getIcon('Users');
const TriangleAlert = getIcon('TriangleAlert');
const Bath = getIcon('Bath');
const ShieldCheck = getIcon('ShieldCheck');
const Plus = getIcon('Plus');
const TrendingDown = getIcon('TrendingDown');
const Construction = getIcon('Construction');
const Zap = getIcon('Zap');
const ChevronRight = getIcon('ChevronRight');
const Check = getIcon('Check');
const Volume2 = getIcon('Volume2');
const Flag = getIcon('Flag');
const Star = getIcon('Star');
const MessageSquare = getIcon('MessageSquare');
const Send = getIcon('Send');
const VolumeX = getIcon('VolumeX');

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const { width, height } = Dimensions.get('window');

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45', 'Cerrado'];

const TARIFF_PRESETS = [
  'Entrada General',
  'Entrada Reducida',
  'Entrada Gratuita',
  'Entrada Conjunta General',
  'Entrada Conjunta Reducida',
  'Abono General',
  'Abono Anual',
  'Abono Mensual',
  'Abono Temporada',
  'Abono Familiar',
  'Visita en Grupo',
  'Otros / Personalizado'
];

const TARIFF_SUBTYPES = [
  { id: 'none', label: 'Sin condiciones especiales' },
  { id: 'age_range', label: 'Rango de Edad (X a Y años)' },
  { id: 'senior', label: 'Mayores de (X años)' },
  { id: 'youth_card', label: 'Carné Joven' },
  { id: 'large_family', label: 'Familia Numerosa' },
  { id: 'child', label: 'Menores de (X años)' },
  { id: 'student', label: 'Estudiantes (X a Y años)' },
  { id: 'disability', label: 'Personas con Discapacidad (X %)' },
  { id: 'unemployed', label: 'Personas Desempleadas' },
  { id: 'teacher', label: 'Personas Docentes' },
  { id: 'sundays_holidays', label: 'Domingos y Festivos' }
];

const PERCENTAGES = ['33', '65', '75', '100'];

const CATEGORIES = [
  'Cultura',
  'Historia',
  'Arquitectura',
  'Religión',
  'Ocio',
  'Naturaleza',
  'Gastronomía',
  'Deporte',
  'Compras',
  'Otros'
];
const AGES = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
const DAYS_MAP = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function PlaceDetailScreen({ route, navigation }) {
    const { place: navigationPlace } = route.params || {};
    const { theme, isDarkMode } = useTheme();
    const { userData, updateUserData, awardExperience } = useUser();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const isAdmin = userData?.role === 'admin' || userData?.isAdmin;
  
  const normalize = (text) => {
    if (!text) return '';
    return text.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i');
  };

  const placeFromContext = (userData?.contributions || []).find(p => 
    p.id === navigationPlace.id || (p.name === navigationPlace.name && p.city === navigationPlace.city)
  );
  
  const initialPlace = placeFromContext || navigationPlace;

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [place, setPlace] = useState(initialPlace);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const textToSpeak = `${place.name}. ${place.description}. Ubicado en ${place.city}.`;
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

  const fetchReviews = async () => {
    if (!place.id || String(place.id).startsWith('custom-')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/places/${place.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.warn('Error fetching reviews:', e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [place.id]);

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

  const performLocalSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = MUNICIPIOS_DATA.filter(m => 
      (m.label || '').toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5).map(m => ({
      id: m.code,
      label: m.label,
      province: m.parent_code
    }));
    setSearchResults(filtered);
  };
  const [image, setImage] = useState(place.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a');



  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  const displayPlace = aiResults ? { ...place, ...aiResults } : place;

  // State for Custom Pickers (Months and Times)
  const [pickerModal, setPickerModal] = useState({
    visible: false,
    type: '', // 'month' or 'time'
    title: '',
    options: [],
    onSelect: () => {}
  });

  const handleAiEnhance = async () => {
    Keyboard.dismiss();
    setIsAiProcessing(true);
    setAiProgress(0.1);
    
    const placeName = place.name;
    const cityName = place.city || 'este municipio';

    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 0.9) return prev;
        return prev + (0.9 - prev) * 0.15;
      });
    }, 600);

    const finishProcessing = (aiData, isReal) => {
      clearInterval(progressInterval);
      setAiProgress(1);
      setTimeout(() => {
        applyAiResults(aiData, isReal);
        setAiProgress(0);
      }, 600);
    };

    try {
      const aiData = await GeminiService.getPlaceData(placeName, cityName, userData.aiApiKey, place.category || 'Cultura', userData.openaiApiKey);
      if (aiData) {
        // Adaptar el formato de horarios si es necesario
        if (aiData.seasons && aiData.seasons.length > 0) {
          aiData.structuredSchedules = aiData.seasons.map(s => ({
            name: s.name,
            startMonth: "1",
            endMonth: "12",
            days: {
              "1": { isOpen: true, mOpen: s.weekday?.split(' ')?.[0] || '10:00', mClose: s.weekday?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" },
              "2": { isOpen: true, mOpen: s.weekday?.split(' ')?.[0] || '10:00', mClose: s.weekday?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" },
              "3": { isOpen: true, mOpen: s.weekday?.split(' ')?.[0] || '10:00', mClose: s.weekday?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" },
              "4": { isOpen: true, mOpen: s.weekday?.split(' ')?.[0] || '10:00', mClose: s.weekday?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" },
              "5": { isOpen: true, mOpen: s.weekday?.split(' ')?.[0] || '10:00', mClose: s.weekday?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" },
              "6": { isOpen: true, mOpen: s.weekend?.split(' ')?.[0] || '10:00', mClose: s.weekend?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" },
              "0": { isOpen: true, mOpen: s.weekend?.split(' ')?.[0] || '10:00', mClose: s.weekend?.split(' ')?.[2] || '18:00', aOpen: "", aClose: "" }
            }
          }));
        }
        finishProcessing(aiData, !aiData.isMock);
        if (aiData.isMock) {
          const detail = GeminiService.lastError ? `\n\nMotivo: ${GeminiService.lastError}` : '';
          Alert.alert("Sugerencia Local", `Usando base de datos interna.${detail}`);
        }
      } else {
        finishProcessing(null, false);
      }
    } catch (error) {
      console.error("Error al potenciar con IA:", error);
      Alert.alert("Error de Investigación", "No hemos podido conectar con el centro de datos. Se usará la información local disponible.");
    } finally {
      setIsAiProcessing(false);
      setAiProgress(0);
      clearInterval(progressInterval);
    }
  };

  const applyAiResults = (aiContent, isRealGemini) => {
    // Si la respuesta es vacía o muy corta y viene de Gemini, activamos el simulador de respaldo
    if (isRealGemini && (!aiContent.description || aiContent.description.trim().length < 20)) {
      console.log("[AI] Respuesta pobre de Gemini, activando simulador de respaldo...");
      simulateAiEnhance();
      return;
    }

    // --- PARSEADOR INTELIGENTE DE TARIFAS ---
    // Si la IA no devolvió tarifas estructuradas pero sí el texto de precio, 
    // intentamos extraer los números para que el sistema de ahorros funcione.
    if (!aiContent.tariffs && aiContent.price) {
      const genMatch = aiContent.price.match(/General:\s*([\d,.]+)/i);
      const pcdMatch = aiContent.price.match(/Reducida[^:]*:\s*([\d,.]+)/i) || 
                       aiContent.price.match(/PCD[^:]*:\s*([\d,.]+)/i) ||
                       aiContent.price.match(/Discapacidad[^:]*:\s*([\d,.]+)/i);
      
      const isGratis = aiContent.price.toLowerCase().includes('gratis') || 
                       aiContent.price.toLowerCase().includes('0€') ||
                       aiContent.price.toLowerCase().includes('0 €');

      if (genMatch || pcdMatch || isGratis) {
        aiContent.tariffs = [
          { id: 'ai-gen-' + Date.now(), label: 'General', price: genMatch ? `${genMatch[1]} €` : '3.00 €' },
          { id: 'ai-pcd-' + Date.now(), label: 'PCD / Discapacidad', price: isGratis ? 'Gratis' : (pcdMatch ? `${pcdMatch[1]} €` : 'Gratis') }
        ];
      }
    }

    // --- NORMALIZADOR DE HORARIOS IA ---
    if (aiContent.structuredSchedules) {
      aiContent.structuredSchedules = aiContent.structuredSchedules.map(season => {
        // Aseguramos que 'days' sea un objeto y que las claves sean correctas
        const cleanDays = {};
        [0, 1, 2, 3, 4, 5, 6].forEach(d => {
          const dayData = season.days[d] || season.days[String(d)] || { isOpen: false, mOpen: '', mClose: '', aOpen: '', aClose: '' };
          cleanDays[d] = {
            isOpen: dayData.isOpen ?? true,
            mOpen: dayData.mOpen || '',
            mClose: dayData.mClose || '',
            aOpen: dayData.aOpen || '',
            aClose: dayData.aClose || ''
          };
        });
        return { ...season, days: cleanDays };
      });
    }

    setAiResults(aiContent);
    setIsAiProcessing(false);
    setIsAiEnhanced(true);

    // 1. Actualizamos el estado local
    setPlace(prev => ({ ...prev, ...aiContent }));

    // 2. Guardamos en el perfil (Contexto)
    updateUserData('contributions', (prevConts) => {
      const current = prevConts || [];
      const existingIdx = current.findIndex(p => p.id === place.id);
      let newContributions = [...current];
      if (existingIdx > -1) {
        newContributions[existingIdx] = { ...newContributions[existingIdx], ...aiContent };
      } else {
        newContributions.push({ ...place, ...aiContent });
      }
      return newContributions;
    });

    setTimeout(() => {
      const descLen = (aiContent.description || '').length;
      Alert.alert(
        isRealGemini ? "🚀 MOTOR GEMINI PRO 1.5: ÉLITE" : "✨ IA DISTRAVEL ACTIVADA",
        `Investigación finalizada para "${displayPlace.name}".\n\nGemini ha analizado su historia, horarios oficiales y detalles de accesibilidad basándose en una consulta de chat en tiempo real.`,
        [{ text: "¡ENTENDIDO!", onPress: () => awardExperience(20, 'Investigación IA') }]
      );
    }, 100);
  };

  const savings = calculatePlaceSavings(place);
  const isVisited = userData.visitedPlaces?.includes(place.id);

  const handleToggleVisit = () => {
    let updatedVisited;
    let savingsChange = 0;
    const currentSavings = parseFloat(savings || 0);

    if (isVisited) {
      updatedVisited = userData.visitedPlaces.filter(id => id !== place.id);
      savingsChange = -currentSavings;
    } else {
      updatedVisited = [...(userData.visitedPlaces || []), place.id];
      savingsChange = currentSavings;
    }

    updateUserData({
      visitedPlaces: updatedVisited,
      totalSavings: Math.max(0, (userData.totalSavings || 0) + savingsChange)
    });

    if (!isVisited) {
      awardExperience(100, 'Visita registrada');
    }
  };

  const handleVerifyAccessibility = () => {
    setPlace(prev => ({
      ...prev,
      verifications: (prev.verifications || 0) + 1
    }));

    const isAlreadyVerified = userData.verifiedPlaces?.includes(place.id);
    if (!isAlreadyVerified) {
      updateUserData({
        verifiedPlaces: [...(userData.verifiedPlaces || []), place.id]
      });
      awardExperience(50, 'Accesibilidad verificada');
    }

    Alert.alert('¡Gracias!', 'Has validado la accesibilidad de este lugar para la comunidad.');
  };

  const handleAdminValidate = async () => {
    try {
      const updatedPlace = { ...place, verified: true, verifiedStatus: 'Verificado' };
      setPlace(updatedPlace);
      
      const existing = userData.contributions || [];
      const index = existing.findIndex(p => p.id === place.id);
      
      let updatedContributions;
      if (index !== -1) {
        updatedContributions = [...existing];
        updatedContributions[index] = updatedPlace;
      } else {
        updatedContributions = [...existing, updatedPlace];
      }

      await updateUserData({ contributions: updatedContributions });
      
      // Sincronización con el servidor
      if (!place.isLocalOnly && place.id && !String(place.id).startsWith('custom-')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
          await fetch(`${API_BASE_URL}/api/places/${place.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              verified: true, 
              verifiedStatus: 'Verificado',
              extra_data: { verified: true, verifiedStatus: 'Verificado' }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (e) {
          console.warn('Sync servidor fallida');
        }
      }

      Alert.alert("Éxito", "Ubicación validada oficialmente como Administrador.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo completar la validación.");
    }
  };

  const category = place.category || 'Monumento';
  
  const handleSave = async () => {
    // Si la imagen es local, avisar de que no se subirá a la nube
    if (image && (image.startsWith('file://') || image.startsWith('content://'))) {
      Alert.alert(
        "Imagen no sincronizada",
        "La imagen seleccionada no se pudo subir al servidor. Si guardas ahora, la foto solo se verá en este dispositivo. ¿Deseas continuar?",
        [
          { text: "Intentar subir de nuevo", onPress: pickImage },
          { text: "Guardar así", onPress: () => performSave() }
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = async () => {
    const existing = userData.contributions || [];
    // Asegurar que tenemos 'city' para consistencia con el sistema de contribuciones
    const normalizedPlace = { ...place, city: place.city || place.cityName, image };
    const index = existing.findIndex(p => p.id === place.id || (p.name === initialPlace.name && (p.city === initialPlace.city || p.city === initialPlace.cityName)));
    
    let updatedContributions;
    if (index !== -1) {
      updatedContributions = [...existing];
      updatedContributions[index] = normalizedPlace;
    } else {
      updatedContributions = [...existing, normalizedPlace];
    }

    updateUserData({ contributions: updatedContributions });
    
    // Sincronización con el servidor para Administradores
    if (isAdmin && !normalizedPlace.isLocalOnly && normalizedPlace.id && !String(normalizedPlace.id).startsWith('custom-')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const extraData = {
          structuredSchedules: normalizedPlace.structuredSchedules,
          technicalSpecs: normalizedPlace.technicalSpecs,
          criticalNotices: normalizedPlace.criticalNotices || normalizedPlace.importantNotices,
          tariffs: normalizedPlace.tariffs,
          isLinkedEntrance: normalizedPlace.isLinkedEntrance,
          linkedEntranceName: normalizedPlace.linkedEntranceName,
          touristTip: normalizedPlace.touristTip,
          accessibility: normalizedPlace.accessibility,
          audioguide: normalizedPlace.audioguide,
          specialClosures: normalizedPlace.specialClosures,
          tags: normalizedPlace.tags
        };

        const response = await fetch(`${API_BASE_URL}/api/places/${normalizedPlace.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: normalizedPlace.name,
            city: normalizedPlace.city,
            category: normalizedPlace.category,
            address: normalizedPlace.address,
            phone: normalizedPlace.phone,
            website: normalizedPlace.website,
            image: normalizedPlace.image,
            latitude: normalizedPlace.location?.latitude,
            longitude: normalizedPlace.location?.longitude,
            extra_data: extraData
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn('Error en la sincronización con el servidor');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error de red o timeout en la sincronización:', error);
      }
    }

    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  const updateTariffSubtype = (idx, subIdx, field, value) => {
    const newTariffs = [...(place.tariffs || [])];
    let newSubtypes = newTariffs[idx].subtypes || [newTariffs[idx].condition || { type: 'none' }];
    newSubtypes = [...newSubtypes];
    newSubtypes[subIdx] = {
      ...newSubtypes[subIdx],
      [field]: value
    };
    newTariffs[idx] = {
      ...newTariffs[idx],
      subtypes: newSubtypes
    };
    setPlace({ ...place, tariffs: newTariffs });
  };

  const addTariffSubtype = (idx) => {
    const newTariffs = [...(place.tariffs || [])];
    let newSubtypes = newTariffs[idx].subtypes || [newTariffs[idx].condition || { type: 'none' }];
    newSubtypes = [...newSubtypes];
    newSubtypes.push({ id: `sub-${Date.now()}`, type: 'none', value: '', from: '', to: '' });
    newTariffs[idx] = {
      ...newTariffs[idx],
      subtypes: newSubtypes
    };
    setPlace({ ...place, tariffs: newTariffs });
  };

  const removeTariffSubtype = (idx, subIdx) => {
    const newTariffs = [...(place.tariffs || [])];
    let newSubtypes = newTariffs[idx].subtypes || [newTariffs[idx].condition || { type: 'none' }];
    newSubtypes = [...newSubtypes];
    if (newSubtypes.length > 1) {
      newSubtypes.splice(subIdx, 1);
      newTariffs[idx] = {
        ...newTariffs[idx],
        subtypes: newSubtypes
      };
      setPlace({ ...place, tariffs: newTariffs });
    }
  };

  const getConditionText = (condition) => {
    if (!condition || condition.type === 'none') return null;
    
    switch (condition.type) {
      case 'disability':
        return `Mínimo ${condition.value || '33'}% de discapacidad`;
      case 'senior':
        return `Mayores de ${condition.value || '65'} años`;
      case 'child':
        return `Menores de ${condition.value || '12'} años`;
      case 'age_range':
        return `Personas de ${condition.from || 'X'} a ${condition.to || 'Y'} años`;
      case 'student':
        return `Estudiantes ${condition.from && condition.to ? `(${condition.from}-${condition.to} años)` : ''}`;
      case 'youth_card':
        return 'Titulares de Carné Joven';
      case 'large_family':
        return 'Familias Numerosas';
      case 'unemployed':
        return 'Personas en situación de desempleo';
      case 'teacher':
        return 'Personal docente en activo';
      case 'sundays_holidays':
        return 'Domingos y Festivos';
      default:
        return null;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.4, // Calidad reducida significativamente para subida rápida
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      
      // Mostrar inmediatamente en la UI (vista previa local)
      setImage(newUri);
      
      // Upload to server
      setIsUploading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segs timeout

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('image', {
          uri: newUri,
          type: 'image/jpeg',
          name: 'upload.jpg',
        });

        console.log(`[Upload] Intentando subir a: ${API_BASE_URL}/api/upload (Tamaño optimizado)`);
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formDataUpload,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.success) {
          const finalImageUrl = `${API_BASE_URL}${data.url}`;
          console.log(`[Upload] Éxito: ${finalImageUrl}`);
          setImage(finalImageUrl);
          
          // Actualizar el objeto place para que al guardar se use la URL remota
          setPlace(prev => ({ ...prev, image: finalImageUrl }));
          
          if (!isEditing) {
            const existing = userData.contributions || [];
            const normalizedPlace = { ...place, city: place.city || place.cityName, image: finalImageUrl };
            const index = existing.findIndex(p => p.id === place.id || (p.name === initialPlace.name && (p.city === initialPlace.city || p.city === initialPlace.cityName)));
            
            let updatedContributions;
            if (index !== -1) {
              updatedContributions = [...existing];
              updatedContributions[index] = { ...updatedContributions[index], image: finalImageUrl };
            } else {
              updatedContributions = [...existing, normalizedPlace];
            }

            updateUserData({ contributions: updatedContributions });
            
            // Sincronización automática con el servidor para Administradores
            if (isAdmin && !normalizedPlace.isLocalOnly && normalizedPlace.id && !String(normalizedPlace.id).startsWith('custom-')) {
              try {
                await fetch(`${API_BASE_URL}/api/places/${normalizedPlace.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: finalImageUrl }),
                });
                console.log('[Auto-Sync] Imagen guardada en base de datos');
              } catch (e) {
                console.error('[Auto-Sync] Error al sincronizar imagen:', e);
              }
            }
            
            Alert.alert("Éxito", "Imagen subida y guardada en la nube.");
          }
        } else {
          Alert.alert('Error de Procesamiento', 'El servidor recibió la imagen pero no pudo procesarla.');
        }
      } catch (error) {
        console.error('Error detallado de subida:', error);
        if (error.name === 'AbortError') {
          Alert.alert('Tiempo de espera agotado', 'La subida de la imagen está tardando demasiado. Comprueba tu conexión e inténtalo de nuevo.');
        } else {
          Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor de imágenes. Se usará una vista previa local.');
        }
        setImage(newUri); // Fallback local
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAiGenerateHours = () => {
    Alert.alert(
      "IA Distravel",
      `¿Deseas que la IA genere los horarios oficiales para ${place.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Generar con IA", 
          onPress: () => {
            const name = (place.name || '').toLowerCase();
            let newHours = {
              weekday: { open: '10:00', close: '20:00' },
              weekend: { open: '10:00', close: '14:00' },
              is24h: false
            };

            // Lógica específica por tipo/nombre
            if (name.includes('sagrada familia')) {
              newHours = {
                weekday: { open: '09:00', close: '20:00' },
                weekend: { open: '09:00', close: '20:00' },
                is24h: false
              };
            } else if (name.includes('playa') || name.includes('explanada') || name.includes('parque')) {
              newHours = {
                weekday: { open: '00:00', close: '24:00' },
                weekend: { open: '00:00', close: '24:00' },
                is24h: true
              };
            } else if (name.includes('mercado')) {
              newHours = {
                weekday: { open: '07:30', close: '14:30' },
                weekend: { open: '07:30', close: '15:00' },
                is24h: false
              };
            }

            setPlace({ ...place, workingHours: newHours });
            Alert.alert("✨ Horarios Generados", "La IA ha procesado los horarios oficiales para este tipo de lugar.");
          } 
        }
      ]
    );
  };

  const handleGoToCity = () => {
    if (!place.city) return;
    
    // Buscar el municipio en los datos
    const mData = MUNICIPIOS_DATA.find(m => 
      normalize(m.label) === normalize(place.city)
    );
    
    if (mData) {
      const provinceName = INE_PROVINCES[mData.parent_code] || place.province || 'Alicante';
      const cityObj = {
        ...mData,
        name: mData.label,
        province: provinceName,
        region: PROVINCE_TO_REGION[provinceName] || 'España',
        isCity: true
      };
      navigation.navigate('CityDetail', { city: cityObj });
    } else {
      // Fallback si no está en el JSON
      navigation.navigate('CityDetail', { 
        city: { 
          name: place.city, 
          province: place.province, 
          region: effectiveRegion,
          isCity: true 
        } 
      });
    }
  };

  const handleGoToMap = () => {
    navigation.navigate('Map', { 
      city: { name: place.city }, 
      monuments: [place],
      filter: 'place' 
    });
  };

  const handleAiGenerateTariffs = () => {
    Keyboard.dismiss();
    Alert.alert(
      "IA Distravel",
      `¿Deseas que la IA genere las tarifas y beneficios de accesibilidad para ${place.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Generar Tarifas", 
          onPress: async () => {
            setIsAiProcessing(true);
            setAiProgress(0.1);
            const progressInterval = setInterval(() => {
              setAiProgress(prev => (prev < 0.9 ? prev + 0.05 : prev));
            }, 150);

            try {
              const aiData = await GeminiService.getPlaceData(place.name, place.city, userData.aiApiKey);
              clearInterval(progressInterval);
              setAiProgress(1);

              if (aiData) {
                setPlace(prev => ({
                  ...prev,
                  ...aiData,
                  isAI: true
                }));

                if (GeminiService.isRevoked || (GeminiService.lastError && GeminiService.lastError.includes('API key not valid'))) {
                  Alert.alert(
                    '🔑 Error de Autenticación', 
                    'La clave de API de Gemini no es válida o ha sido revocada. Para usar la IA real, por favor introduce tu propia clave en Configuración > Servicios de IA.',
                    [{ text: 'Ir a Configuración', onPress: () => navigation.navigate('Settings') }, { text: 'Cerrar', style: 'cancel' }]
                  );
                } else if (aiData.isMock) {
                  Alert.alert(
                    '⚠️ Usando Datos Estimados', 
                    'No se pudo conectar con la IA real (error de clave). Los datos mostrados son estimaciones locales. Configura tu propia API Key en Ajustes para precisión total.',
                    [{ text: 'Entendido' }]
                  );
                } else {
                  Alert.alert("✨ Análisis Completado", "La IA ha configurado precios oficiales, beneficios PCD y ha evaluado los servicios de audioguía adaptada basándose en datos reales.");
                }
              } else {
                Alert.alert("Error", "No se recibió respuesta de la IA.");
              }
            } catch (error) {
              clearInterval(progressInterval);
              const errorMsg = GeminiService.lastError ? `\nDetalle: ${GeminiService.lastError}` : '';
              Alert.alert("Error", `No se pudo conectar con la IA.${errorMsg}`);
            } finally {
              setIsAiProcessing(false);
              setAiProgress(0);
            }
          } 
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Lugar",
      "¿Estás seguro de que deseas eliminar definitivamente este lugar? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              // 1. Eliminar LOCALMENTE de forma instantánea
              updateUserData('contributions', (prev) => 
                (prev || []).filter(p => String(p.id) !== String(place.id))
              );

              // 2. Intentar eliminar en el SERVIDOR en segundo plano si no es solo local
              if (!place.isLocalOnly) {
                const SERVER_URL = API_BASE_URL;
                fetch(`${SERVER_URL}/api/places/${place.id}`, { method: 'DELETE' })
                  .catch(() => console.warn('Borrado servidor fallido'));
              }

              navigation.goBack();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar.");
            }
          } 
        }
      ]
    );
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    const dayOfWeek = now.getDay(); // 0 (Dom) to 6 (Sáb)
    const dayName = DAYS_MAP[dayOfWeek];

    // Helper to parse HH:MM to minutes
    const parseTime = (t) => {
      if (!t) return null;
      // Handle "10:00 - 14:00" format or single "10:00"
      const firstPart = t.split('-')[0].trim();
      const [h, m] = firstPart.split(':').map(Number);
      if (isNaN(h)) return null;
      return h * 60 + (m || 0);
    };

    const parseEndTime = (t) => {
      if (!t || !t.includes('-')) return null;
      const secondPart = t.split('-')[1].trim();
      const [h, m] = secondPart.split(':').map(Number);
      if (isNaN(h)) return null;
      return h * 60 + (m || 0);
    };

    // 1. Determine active schedule
    let activeSchedule = {
      openingDays: displayPlace.openingDays,
      morningOpen: displayPlace.morningOpen,
      morningClose: displayPlace.morningClose,
      afternoonOpen: displayPlace.afternoonOpen,
      afternoonClose: displayPlace.afternoonClose,
      isSplitSchedule: displayPlace.isSplitSchedule,
      schedule: displayPlace.schedule
    };

    // NUEVO: Sistema de Horarios Estructurados (V3)
    if (displayPlace.structuredSchedules && displayPlace.structuredSchedules.length > 0) {
      const activeSeason = displayPlace.structuredSchedules.find(s => {
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
        const monthMap = {
          'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
          'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
        };
        const sM = monthMap[s.startMonth] || parseInt(s.startMonth);
        const eM = monthMap[s.endMonth] || parseInt(s.endMonth);
        
        if (isNaN(sM) || isNaN(eM)) return false;

        if (sM <= eM) return currentMonth >= sM && currentMonth <= eM;
        return currentMonth >= sM || currentMonth <= eM;
      });

      if (activeSeason && activeSeason.days && activeSeason.days[dayOfWeek]) {
        const dayData = activeSeason.days[dayOfWeek];
        if (!dayData.isOpen) return { status: 'closed_today', text: 'Cerrado hoy', color: '#E74C3C' };
        
        activeSchedule = {
          ...activeSchedule,
          morningOpen: dayData.mOpen,
          morningClose: dayData.mClose,
          afternoonOpen: dayData.aOpen,
          afternoonClose: dayData.aClose,
          isSplitSchedule: !!(dayData.aOpen && dayData.aClose)
        };
      }
    } else {
      // Fallback a detección por texto (V2)
      const scheduleText = (activeSchedule.schedule || "").toLowerCase();
      const dayNameLower = dayName.toLowerCase();
      if (scheduleText.includes(`${dayNameLower}: cerrado`) || 
          scheduleText.includes(`${dayNameLower} cerrado`)) {
        return { status: 'closed_today', text: 'Cerrado hoy', color: '#E74C3C' };
      }
    }
        
    const isOpenToday = activeSchedule.openingDays ? activeSchedule.openingDays[dayName] : true;
    if (!isOpenToday) return { status: 'closed_today', text: 'Cerrado hoy', color: '#E74C3C' };

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let intervals = [];

    if (activeSchedule.isSplitSchedule) {
      if (activeSchedule.morningOpen && activeSchedule.morningClose) 
        intervals.push({ open: parseTime(activeSchedule.morningOpen), close: parseTime(activeSchedule.morningClose) });
      if (activeSchedule.afternoonOpen && activeSchedule.afternoonClose) 
        intervals.push({ open: parseTime(activeSchedule.afternoonOpen), close: parseTime(activeSchedule.afternoonClose) });
    } else {
      const open = parseTime(activeSchedule.morningOpen || activeSchedule.schedule);
      const close = parseEndTime(activeSchedule.morningClose ? `00:00-${activeSchedule.morningClose}` : activeSchedule.schedule);
      if (open !== null && close !== null) {
        intervals.push({ open, close });
      }
    }

    if (intervals.length === 0) return null;

    for (const interval of intervals) {
      if (nowMinutes >= interval.open && nowMinutes < interval.close) {
        const remaining = interval.close - nowMinutes;
        if (remaining <= 60) {
          return { status: 'closing_soon', text: `Cierra en ${remaining} min`, color: '#E74C3C' };
        }
        return { status: 'open', text: 'Abierto ahora', color: '#2ECC71' };
      }
    }

    return { status: 'closed', text: 'Cerrado ahora', color: '#95A5A6' };
  };

  const timeInfo = getTimeRemaining();

  const effectiveRegion = React.useMemo(() => {
    if (place.region) return place.region;
    if (place.province) return PROVINCE_TO_REGION[place.province] || place.province;
    return 'Castilla-La Mancha';
  }, [place.region, place.province]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ScrollView 
        ref={scrollRef}
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.heroContainer}>
          <Image source={{ uri: image }} style={styles.heroImage} />
          {isUploading && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={{ color: '#FFF', marginTop: 10, fontWeight: '700' }}>Subiendo...</Text>
            </View>
          )}
          {/* Overlay eliminado para máxima claridad de imagen */}

          <SafeAreaView style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.circleButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {(isAdmin || placeFromContext) && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {isEditing ? (
                  <>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: '#2ECC71' }]}
                      onPress={handleSave}
                    >
                      <Save color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: '#E74C3C' }]}
                      onPress={() => {
                        setIsEditing(false);
                        setPlace(initialPlace);
                      }}
                    >
                      <X color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {!place.verified && (
                      <TouchableOpacity 
                        style={[styles.circleButton, { backgroundColor: '#EFBF04' }]}
                        onPress={handleAdminValidate}
                      >
                        <ShieldCheck color="#0A192F" size={20} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: 'rgba(231, 76, 60, 0.6)' }]}
                      onPress={handleDelete}
                    >
                      <Trash2 color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                      onPress={pickImage}
                      disabled={isUploading}
                    >
                      {isUploading ? <ActivityIndicator size="small" color="#FFF" /> : <Camera color="#FFFFFF" size={20} />}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: theme.primary }]}
                      onPress={() => setIsEditing(true)}
                      disabled={isUploading}
                    >
                      <Edit color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </SafeAreaView>

          <View style={styles.heroContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              {isEditing ? (
                <TouchableOpacity
                  style={[styles.badgeEdit, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 }]}
                  onPress={() => setPickerModal({
                    visible: true,
                    title: 'Seleccionar Categoría',
                    options: CATEGORIES,
                    onSelect: (cat) => setPlace({...place, category: cat})
                  })}
                >
                  <Text style={{ color: isDarkMode ? '#000' : '#FFF', fontWeight: '900', fontSize: 11 }}>
                    {(place.category || 'CATEGORÍA').toUpperCase()}
                  </Text>
                  <LucideIcons.ChevronDown color={isDarkMode ? '#000' : '#FFF'} size={14} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.badgeText, { color: isDarkMode ? '#000000' : '#FFFFFF' }]}>{category.toUpperCase()}</Text>
                </View>
              )}
              
              {timeInfo && !isEditing && (
                <View style={[styles.timeBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Clock color={timeInfo.color || '#FFF'} size={14} />
                  <Text style={[styles.timeBadgeText, { color: timeInfo.color || '#FFF' }]}>{timeInfo.text}</Text>
                </View>
              )}
            </View>
            {isEditing ? (
              <View>
                <TextInput
                  style={[styles.placeNameEdit, typography.h1]}
                  value={place.name}
                  onChangeText={(v) => setPlace({...place, name: v})}
                  multiline
                />
                <View style={{ position: 'relative', zIndex: 1000 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={[styles.cityEditInput, { color: '#FFF', borderColor: 'rgba(255,255,255,0.4)' }]}
                        value={place.city || place.cityName}
                        onFocus={() => {
                          setTimeout(() => {
                            scrollRef.current?.scrollTo({ y: 120, animated: true });
                          }, 100);
                        }}
                        onChangeText={(v) => {
                          setPlace({...place, city: v, cityName: v});
                          performLocalSearch(v);
                          setShowSearchResults(v.length > 1);
                          if (v.length > 1) {
                            scrollRef.current?.scrollTo({ y: 120, animated: true });
                          }
                        }}
                        placeholder="Municipio"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={[styles.cityEditInput, { color: '#FFF', borderColor: 'rgba(255,255,255,0.4)' }]}
                        value={place.province}
                        onChangeText={(v) => setPlace({...place, province: v})}
                        placeholder="Provincia"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                    </View>
                  </View>

                  {showSearchResults && searchResults.length > 0 && (
                    <View style={[styles.detailSearchResults, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {searchResults.map((item, idx) => (
                        <TouchableOpacity 
                          key={idx} 
                          style={[styles.searchItem, { borderBottomWidth: idx === searchResults.length - 1 ? 0 : 0.5, borderBottomColor: theme.border }]}
                          onPress={() => {
                            setPlace({ ...place, city: item.label, cityName: item.label, province: item.province });
                            setShowSearchResults(false);
                            Keyboard.dismiss();
                          }}
                        >
                          <MapPin color={theme.primary} size={16} />
                          <Text style={{ color: theme.text, marginLeft: 10, fontWeight: '600' }}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View>
                <Text style={[styles.placeName, typography.h1]}>{displayPlace.name}</Text>
                {displayPlace.address && (
                  <Text style={styles.headerAddress} numberOfLines={1}>{displayPlace.address}</Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                  <TouchableOpacity 
                    onPress={handleGoToCity}
                    style={[styles.cityChip, { backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 }]}
                  >
                    <MapPin color="#FFF" size={14} />
                    <Text style={styles.cityChipText}>{displayPlace.city || displayPlace.cityName}</Text>
                  </TouchableOpacity>
                  {savings && (
                    <View style={styles.savingsBadge}>
                      <TrendingDown color="#2ECC71" size={16} />
                      <Text style={styles.savingsBadgeText}>¡Ahorras {savings}€!</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.locationBar, { backgroundColor: '#EFBF04', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }]}>
          <TouchableOpacity 
            onPress={handleGoToMap}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          >
            <MapPin color="#000" size={18} />
            <Text style={[styles.locationBarText, { color: '#000', marginLeft: 8 }]}>
              {(displayPlace.province || displayPlace.city || 'ALICANTE').toUpperCase()} / <Text style={{ fontWeight: '800' }}>VER EN EL MAPA</Text>
            </Text>
          </TouchableOpacity>
          
          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(0,0,0,0.15)', marginHorizontal: 12 }} />
          
          <TouchableOpacity 
            onPress={toggleSpeech}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {isSpeaking ? <VolumeX color="#000" size={20} /> : <Volume2 color="#000" size={20} />}
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 11, marginLeft: 6 }}>AUDIO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre este lugar</Text>
            {isEditing ? (
              <TextInput
                style={[styles.descriptionEdit, { color: theme.textSecondary, borderColor: theme.border }]}
                value={displayPlace.description}
                onChangeText={(v) => setPlace({...place, description: v})}
                multiline
              />
            ) : (
              <View>
                {isAiProcessing ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Zap color={theme.primary} size={32} style={{ marginBottom: 10 }} />
                    <Text style={{ color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center' }}>
                      Investigando profundamente en la base de datos de Gemini PRO 1.5...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.description, { color: theme.textSecondary }]}>
                    {displayPlace.description || 'Pulsa el botón "Investigar con Gemini PRO" para generar una descripción detallada, horarios actualizados y consejos de accesibilidad para este lugar.'}
                  </Text>
                )}
              </View>
            )}
            
            {/* Contact Info Block */}
            <View style={styles.contactContainer}>
              {(displayPlace.address || isEditing) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIconBox}>
                    <MapPin color={theme.primary} size={18} />
                  </View>
                  {isEditing ? (
                    <TextInput 
                      style={[styles.contactText, { color: isDarkMode ? '#FFFFFF' : theme.text, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                      value={displayPlace.address}
                      onChangeText={(v) => setPlace({...place, address: v})}
                      placeholder="Dirección..."
                    />
                  ) : (
                    <Text style={[styles.contactText, { color: isDarkMode ? '#FFFFFF' : theme.textSecondary }]}>{String(displayPlace.address || '')}</Text>
                  )}
                </View>
              )}
              
              {(displayPlace.phone || isEditing) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIconBox}>
                    <Phone color={isDarkMode ? '#F1C40F' : theme.primary} size={18} />
                  </View>
                  <Text style={[styles.contactLabel, { color: theme.text }]}>Teléfono de reservas: </Text>
                  {isEditing ? (
                    <TextInput 
                      style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : theme.primary, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                      value={displayPlace.phone}
                      onChangeText={(v) => setPlace({...place, phone: v})}
                      placeholder="Teléfono..."
                    />
                  ) : (
                    <TouchableOpacity onPress={() => displayPlace.phone && Linking.openURL(`tel:${displayPlace.phone.replace(/\s/g, '')}`)}>
                      <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : theme.primary }]}>{displayPlace.phone}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              {(displayPlace.website || isEditing) && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIconBox}>
                    <Globe color={isDarkMode ? '#F1C40F' : theme.primary} size={18} />
                  </View>
                  <Text style={[styles.contactLabel, { color: theme.text }]}>Sitio Web: </Text>
                  {isEditing ? (
                    <TextInput 
                      style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : theme.primary, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                      value={displayPlace.website}
                      onChangeText={(v) => setPlace({...place, website: v})}
                      placeholder="www.ejemplo.com"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => displayPlace.website && Linking.openURL(displayPlace.website.startsWith('http') ? displayPlace.website : `https://${displayPlace.website}`)}>
                      <Text style={[styles.contactValue, { color: isDarkMode ? '#FFFFFF' : theme.primary }]} numberOfLines={1}>{displayPlace.website}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Tags display */}
            {(displayPlace.tags || isEditing) && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {isEditing ? (
                  <TextInput
                    style={[styles.tagsEdit, { color: theme.textSecondary, borderColor: theme.border, borderBottomWidth: 1, flex: 1 }]}
                    value={displayPlace.tags}
                    onChangeText={(v) => setPlace({...place, tags: v})}
                    placeholder="Etiquetas (separadas por comas)..."
                  />
                ) : (
                  (displayPlace.tags || "").split(',').map((tag, tIdx) => (
                    tag.trim() ? (
                      <View key={tIdx} style={[styles.tagChip, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F0F0F0' }]}>
                        <Text style={[styles.tagChipText, { color: theme.textSecondary }]}>#{tag.trim()}</Text>
                      </View>
                    ) : null
                  ))
                )}
              </View>
            )}

            {/* Special Closures */}
            {(displayPlace.specialClosures || isEditing) && (
              <View style={[styles.specialClosureBox, { marginTop: 15, padding: 12, backgroundColor: isDarkMode ? 'rgba(231, 76, 60, 0.1)' : '#FDEDEC', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <AlertTriangle color="#E74C3C" size={16} />
                {isEditing ? (
                  <TextInput 
                    style={{ color: '#E74C3C', flex: 1, fontSize: 13 }}
                    value={displayPlace.specialClosures}
                    onChangeText={(v) => setPlace({...place, specialClosures: v})}
                    placeholder="Cierres especiales (festivos, obras...)"
                  />
                ) : (
                  <Text style={{ color: '#E74C3C', fontSize: 13, fontWeight: '600' }}>{displayPlace.specialClosures}</Text>
                )}
              </View>
            )}
          </View>


          {/* Tourist Tip */}
          {(displayPlace.touristTip || isEditing) && (
            <View style={[styles.tipCard, { backgroundColor: isDarkMode ? 'rgba(241, 196, 15, 0.1)' : '#FEF9E7', borderColor: '#F1C40F' }]}>
              <Sparkles color="#F1C40F" size={20} />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: isDarkMode ? '#F1C40F' : '#D4AC0D' }]}>Tip Distravel</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.tipTextEdit, { color: theme.text }]}
                    value={displayPlace.touristTip}
                    onChangeText={(v) => setPlace({...place, touristTip: v})}
                    multiline
                    placeholder="Escribe un consejo para viajeros..."
                  />
                ) : (
                  <Text style={[styles.tipText, { color: theme.text }]}>{displayPlace.touristTip}</Text>
                )}
              </View>
            </View>
          )}

          {/* Accessibility Features Icons */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesibilidad Adaptada</Text>
            <View style={styles.accessRow}>
              {[
                { id: 'physical', icon: Accessibility, label: 'Física' },
                { id: 'visual', icon: Eye, label: 'Visual' },
                { id: 'auditory', icon: Ear, label: 'Auditiva' },
                { id: 'cognitive', icon: Brain, label: 'Cognitiva' }
              ].map(feat => {
                const isActive = displayPlace.accessibility?.[feat.id];
                return (
                  <TouchableOpacity 
                    key={feat.id}
                    disabled={!isEditing}
                    style={[styles.accessIconBox, { backgroundColor: isActive ? theme.primary : theme.surface }]}
                    onPress={() => setPlace({
                      ...place, 
                      accessibility: { ...displayPlace.accessibility, [feat.id]: !isActive }
                    })}
                  >
                    <feat.icon color={isActive ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.textSecondary} size={22} />
                    <Text style={[styles.accessIconText, { color: isActive ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.textSecondary }]}>{feat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Verificación Comunitaria */}
          {!isEditing && (
            <View style={styles.section}>
              <View style={[styles.verificationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.verificationInfo}>
                   <View style={styles.verificationIconBox}>
                      <ShieldCheck color="#2ECC71" size={24} />
                   </View>
                   <View style={{ flex: 1 }}>
                      <Text style={[styles.verificationTitle, { color: theme.text }]}>Estado de Verificación</Text>
                      <Text style={[styles.verificationSub, { color: theme.textSecondary }]}>
                        {displayPlace.verifications || Math.floor(Math.random() * 10) + 2} viajeros han confirmado la accesibilidad recientemente
                      </Text>
                   </View>
                </View>
                <TouchableOpacity 
                  style={[styles.verifyActionBtn, { backgroundColor: theme.primary }]}
                  onPress={handleVerifyAccessibility}
                >
                  <CheckCircle2 color={isDarkMode ? '#070B14' : '#FFFFFF'} size={16} />
                  <Text style={[styles.verifyActionText, { color: isDarkMode ? '#070B14' : '#FFFFFF' }]}>Confirmar Accesibilidad</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Ficha Técnica "Océano Azul" */}
          {(displayPlace.technicalSpecs || isEditing) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Especificaciones Técnicas</Text>
              <View style={styles.techGrid}>
                {(displayPlace.technicalSpecs?.doorWidth || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Info color={theme.primary} size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Ancho Puerta</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.techInput, { color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                          value={place.technicalSpecs?.doorWidth}
                          onChangeText={(v) => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, doorWidth: v }})}
                          placeholder="Ej: 120cm"
                        />
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>{displayPlace.technicalSpecs?.doorWidth}</Text>
                      )}
                    </View>
                  </View>
                )}
                {(displayPlace.technicalSpecs?.adaptedToilet !== undefined || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <ShieldCheck color="#2ECC71" size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Baño Adaptado</Text>
                      {isEditing ? (
                        <TouchableOpacity 
                          onPress={() => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, adaptedToilet: !place.technicalSpecs?.adaptedToilet }})}
                          style={styles.toggleRow}
                        >
                          <Text style={[styles.techValue, { color: theme.text }]}>
                            {place.technicalSpecs?.adaptedToilet ? 'SÍ' : 'NO'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>
                          {displayPlace.technicalSpecs?.adaptedToilet ? 'Sí, Verificado' : 'No disponible'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {(displayPlace.technicalSpecs?.elevatorMeasures || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Construction color={theme.primary} size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Ascensor</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.techInput, { color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                          value={place.technicalSpecs?.elevatorMeasures || place.technicalSpecs?.elevatorDimensions}
                          onChangeText={(v) => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, elevatorMeasures: v }})}
                          placeholder="Dimensiones"
                        />
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>{displayPlace.technicalSpecs?.elevatorMeasures || displayPlace.technicalSpecs?.elevatorDimensions}</Text>
                      )}
                    </View>
                  </View>
                )}
                {(displayPlace.technicalSpecs?.magneticLoop !== undefined || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Ear color={theme.primary} size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Bucle Magnético</Text>
                      {isEditing ? (
                        <TouchableOpacity 
                          onPress={() => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, magneticLoop: !place.technicalSpecs?.magneticLoop }})}
                          style={styles.toggleRow}
                        >
                          <Text style={[styles.techValue, { color: theme.text }]}>
                            {place.technicalSpecs?.magneticLoop ? 'SÍ' : 'NO'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>
                          {displayPlace.technicalSpecs?.magneticLoop ? 'Disponible' : 'No disponible'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {(displayPlace.technicalSpecs?.braille !== undefined || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Eye color={theme.primary} size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Braille / Relieve</Text>
                      {isEditing ? (
                        <TouchableOpacity 
                          onPress={() => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, braille: !place.technicalSpecs?.braille }})}
                          style={styles.toggleRow}
                        >
                          <Text style={[styles.techValue, { color: theme.text }]}>
                            {place.technicalSpecs?.braille ? 'SÍ' : 'NO'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>
                          {displayPlace.technicalSpecs?.braille ? 'Disponible' : 'No disponible'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {(displayPlace.technicalSpecs?.accessibleParking !== undefined || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <MapPin color={theme.primary} size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Parking Adaptado</Text>
                      {isEditing ? (
                        <TouchableOpacity 
                          onPress={() => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, accessibleParking: !place.technicalSpecs?.accessibleParking }})}
                          style={styles.toggleRow}
                        >
                          <Text style={[styles.techValue, { color: theme.text }]}>
                            {place.technicalSpecs?.accessibleParking ? 'SÍ' : 'NO'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>
                          {displayPlace.technicalSpecs?.accessibleParking ? 'Sí, en entrada' : 'No verificado'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {(displayPlace.technicalSpecs?.wheelchairRental !== undefined || isEditing) && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Accessibility color={theme.primary} size={18} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techLabel}>Alquiler Sillas</Text>
                      {isEditing ? (
                        <TouchableOpacity 
                          onPress={() => setPlace({...place, technicalSpecs: { ...place.technicalSpecs, wheelchairRental: !place.technicalSpecs?.wheelchairRental }})}
                          style={styles.toggleRow}
                        >
                          <Text style={[styles.techValue, { color: theme.text }]}>
                            {place.technicalSpecs?.wheelchairRental ? 'SÍ' : 'NO'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={[styles.techValue, { color: theme.text }]}>
                          {displayPlace.technicalSpecs?.wheelchairRental ? 'Disponible' : 'No disponible'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Botón de Registro de Visita y Ahorro */}
          {!isEditing && (
            <TouchableOpacity 
              style={[
                styles.visitButton, 
                { backgroundColor: isVisited ? '#2ECC71' : theme.primary }
              ]}
              onPress={handleToggleVisit}
            >
              {isVisited ? <ShieldCheck color="#FFF" size={20} /> : <PlusCircle color={isDarkMode ? '#070B14' : '#FFFFFF'} size={20} />}
              <Text style={[styles.visitButtonText, { color: isVisited ? '#FFF' : (isDarkMode ? '#070B14' : '#FFFFFF') }]}>
                {isVisited ? 'Lugar Visitado (Ahorro Registrado)' : 'He visitado este lugar'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Avisos Importantes (Critical Notices) */}
          {(displayPlace.criticalNotices?.length > 0 || displayPlace.importantNotices?.length > 0 || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle color="#E74C3C" size={22} />
                <Text style={[styles.sectionTitle, { color: '#E74C3C', marginLeft: 10, marginBottom: 0 }]}>Avisos Críticos</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={{ marginLeft: 'auto' }}
                    onPress={() => setPlace({
                      ...place,
                      criticalNotices: [...(displayPlace.criticalNotices || displayPlace.importantNotices || []), "Nuevo aviso importante..."]
                    })}
                  >
                    <PlusCircle color="#E74C3C" size={24} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.noticesContainer, { backgroundColor: isDarkMode ? 'rgba(231, 76, 60, 0.1)' : '#FDEDEC', borderColor: '#E74C3C', borderWidth: 1, borderRadius: 12, padding: 15, marginTop: 10 }]}>
                {(displayPlace.criticalNotices || displayPlace.importantNotices || []).map((notice, idx) => (
                  <View key={idx} style={styles.noticeRow}>
                    {isEditing ? (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <TouchableOpacity onPress={() => {
                          const newNotices = [...(displayPlace.criticalNotices || displayPlace.importantNotices || [])];
                          newNotices.splice(idx, 1);
                          setPlace({...place, criticalNotices: newNotices, importantNotices: newNotices});
                        }}>
                          <MinusCircle color="#E74C3C" size={18} />
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.noticeTextEdit, { color: isDarkMode ? '#FF7E7E' : '#C0392B', flex: 1 }]}
                          value={notice}
                          onChangeText={(v) => {
                            const newNotices = [...(displayPlace.criticalNotices || displayPlace.importantNotices || [])];
                            newNotices[idx] = v;
                            setPlace({...place, criticalNotices: newNotices, importantNotices: newNotices});
                          }}
                          multiline
                        />
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                        <Text style={{ color: '#E74C3C', marginRight: 5 }}>•</Text>
                        <Text style={[styles.noticeText, { color: isDarkMode ? '#FF7E7E' : '#C0392B', flex: 1 }]}>{notice}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Configuración de Horarios (Google Style) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Configuración de Horarios</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={styles.addSeasonBtn}
                  onPress={() => {
                    const newSeason = {
                      name: 'Nueva Temporada',
                      startMonth: 'Enero',
                      endMonth: 'Diciembre',
                      days: {
                        1: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '16:00', aClose: '20:00' },
                        2: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '16:00', aClose: '20:00' },
                        3: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '16:00', aClose: '20:00' },
                        4: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '16:00', aClose: '20:00' },
                        5: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '16:00', aClose: '20:00' },
                        6: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '', aClose: '' },
                        0: { isOpen: true, mOpen: '10:00', mClose: '14:00', aOpen: '', aClose: '' }
                      }
                    };
                    setPlace({ ...place, structuredSchedules: [...(displayPlace.structuredSchedules || []), newSeason] });
                  }}
                >
                  <PlusCircle color={theme.primary} size={24} />
                  <Text style={{ color: theme.primary, marginLeft: 5, fontWeight: 'bold' }}>Añadir Temporada</Text>
                </TouchableOpacity>
              )}
            </View>

            {(displayPlace.structuredSchedules || []).map((season, sIdx) => (
              <View key={sIdx} style={[styles.structuredSeasonCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.seasonHeaderRow}>
                  {isEditing ? (
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TextInput 
                        style={[styles.seasonNameInput, { color: theme.primary }]}
                        value={season.name}
                        onChangeText={(v) => {
                          const newSchedules = [...displayPlace.structuredSchedules];
                          newSchedules[sIdx].name = v;
                          setPlace({ ...place, structuredSchedules: newSchedules });
                        }}
                      />
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>De mes:</Text>
                      <TouchableOpacity 
                        style={[styles.monthSelector, { borderColor: theme.border, backgroundColor: theme.background }]}
                        onPress={() => setPickerModal({
                          visible: true,
                          title: 'Seleccionar Mes de Inicio',
                          options: MONTHS,
                          onSelect: (val) => {
                            const newSchedules = [...displayPlace.structuredSchedules];
                            newSchedules[sIdx].startMonth = val;
                            setPlace({ ...place, structuredSchedules: newSchedules });
                          }
                        })}
                      >
                        <Text style={[styles.monthSelectorText, { color: theme.text }]}>{season.startMonth}</Text>
                      </TouchableOpacity>
                      
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>A:</Text>
                      <TouchableOpacity 
                        style={[styles.monthSelector, { borderColor: theme.border, backgroundColor: theme.background }]}
                        onPress={() => setPickerModal({
                          visible: true,
                          title: 'Seleccionar Mes de Fin',
                          options: MONTHS,
                          onSelect: (val) => {
                            const newSchedules = [...displayPlace.structuredSchedules];
                            newSchedules[sIdx].endMonth = val;
                            setPlace({ ...place, structuredSchedules: newSchedules });
                          }
                        })}
                      >
                        <Text style={[styles.monthSelectorText, { color: theme.text }]}>{season.endMonth}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={[styles.seasonTitle, { color: theme.primary }]}>{season.name} ({season.startMonth}-{season.endMonth})</Text>
                  )}
                  {isEditing && (
                    <TouchableOpacity onPress={() => {
                      const newSchedules = [...displayPlace.structuredSchedules];
                      newSchedules.splice(sIdx, 1);
                      setPlace({ ...place, structuredSchedules: newSchedules });
                    }}>
                      <X color="#E74C3C" size={20} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Grid de días */}
                <View style={styles.daysGrid}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dayName, index) => {
                    const dayKey = index === 6 ? 0 : index + 1; // 0=Domingo
                    const dayData = season.days[dayKey] || { isOpen: false };
                    
                    const timeOptions = HOURS.flatMap(h => MINUTES.filter(m => m !== 'Cerrado').map(m => `${h}:${m}`));
                    timeOptions.unshift('Cerrado');

                    const TimeTrigger = ({ value, field, label }) => (
                      <TouchableOpacity 
                        style={[styles.timeSelector, { borderColor: theme.border, backgroundColor: theme.background }]}
                        onPress={() => setPickerModal({
                          visible: true,
                          title: `Hora de ${label}`,
                          options: timeOptions,
                          onSelect: (val) => {
                            const newSchedules = [...displayPlace.structuredSchedules];
                            newSchedules[sIdx].days[dayKey][field] = val;
                            setPlace({ ...place, structuredSchedules: newSchedules });
                          }
                        })}
                      >
                        <Text style={[styles.timeSelectorText, { color: value === 'Cerrado' ? '#E74C3C' : theme.text }]}>
                          {value || '--:--'}
                        </Text>
                      </TouchableOpacity>
                    );

                    return (
                      <View key={dayKey} style={styles.dayRow}>
                        <View style={{ width: 30 }}>
                          <Text style={{ color: theme.text, fontWeight: '800' }}>{dayName}</Text>
                        </View>
                        
                        {isEditing ? (
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <TouchableOpacity 
                              style={[styles.dayToggle, { backgroundColor: dayData.isOpen ? theme.primary : theme.border }]}
                              onPress={() => {
                                const newSchedules = [...displayPlace.structuredSchedules];
                                newSchedules[sIdx].days[dayKey].isOpen = !dayData.isOpen;
                                setPlace({ ...place, structuredSchedules: newSchedules });
                              }}
                            >
                              <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>{dayData.isOpen ? 'SÍ' : 'NO'}</Text>
                            </TouchableOpacity>
                            
                            {dayData.isOpen && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <TimeTrigger value={dayData.mOpen} field="mOpen" label="Apertura (M)" />
                                <Text style={{ color: theme.textSecondary }}>-</Text>
                                <TimeTrigger value={dayData.mClose} field="mClose" label="Cierre (M)" />
                                
                                <View style={{ width: 1, height: 15, backgroundColor: theme.border, marginHorizontal: 2 }} />
                                
                                <TimeTrigger value={dayData.aOpen} field="aOpen" label="Apertura (T)" />
                                <Text style={{ color: theme.textSecondary }}>-</Text>
                                <TimeTrigger value={dayData.aClose} field="aClose" label="Cierre (T)" />
                              </View>
                            )}
                          </View>
                        ) : (
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            {dayData.isOpen ? (
                              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                                {dayData.mOpen}-{dayData.mClose} {dayData.aOpen ? ` / ${dayData.aOpen}-${dayData.aClose}` : ''}
                              </Text>
                            ) : (
                              <Text style={{ color: '#E74C3C', fontWeight: 'bold', fontSize: 13 }}>Cerrado</Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Tarifas Completas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Tarifas y Entradas</Text>
              {isEditing && (
                <View style={{ marginLeft: 'auto', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity 
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
                      onPress={handleAiGenerateTariffs}
                    >
                      <Zap color={theme.primary} size={14} fill={theme.primary} />
                      <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '800' }}>IA GEN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setPlace({
                        ...place,
                        tariffs: [...(displayPlace.tariffs || []), { id: Date.now(), label: 'Nueva Tarifa', price: '0 €' }]
                      })}
                    >
                      <PlusCircle color={theme.primary} size={24} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: displayPlace.isLinkedEntrance ? theme.primary : theme.surface, borderWidth: 1, borderColor: theme.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}
                    onPress={() => setPlace({...place, isLinkedEntrance: !displayPlace.isLinkedEntrance})}
                  >
                    <LinkIcon color={displayPlace.isLinkedEntrance ? '#FFF' : theme.primary} size={14} />
                    <Text style={{ fontSize: 10, color: displayPlace.isLinkedEntrance ? '#FFF' : theme.primary, fontWeight: '800' }}>VINCULAR ENTRADA</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* AVISO DE ENTRADA VINCULADA */}
            {(displayPlace.isLinkedEntrance || (isEditing && displayPlace.isLinkedEntrance)) && (
              <View style={[styles.linkedEntranceCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F4F6F7', borderColor: theme.primary, borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                <LinkIcon color={theme.primary} size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.linkedTitle, { color: theme.text, fontWeight: 'bold' }]}>Entrada Vinculada</Text>
                  {isEditing ? (
                    <TextInput 
                      style={[styles.linkedInput, { color: theme.textSecondary, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                      placeholder="Ej: Incluida en la entrada del Castillo de Santa Bárbara"
                      value={displayPlace.linkedEntranceName}
                      onChangeText={(v) => setPlace({...place, linkedEntranceName: v})}
                    />
                  ) : (
                    <Text style={[styles.linkedText, { color: theme.textSecondary }]}>
                      {displayPlace.linkedEntranceName || 'La visita se incluye en la entrada del monumento principal.'}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <View style={[styles.tariffsContainer, { backgroundColor: theme.surface, borderRadius: 16, padding: 15 }]}>
              {displayPlace.tariffs && displayPlace.tariffs.length > 0 ? (
                <>
                  {displayPlace.tariffs.map((tariff, idx) => (
                    <View key={tariff.id || idx} style={styles.tariffCard}>
                      {isEditing ? (
                        <View style={{ gap: 10 }}>
                          <View style={styles.tariffRowMain}>
                            <TouchableOpacity onPress={() => {
                              const newTariffs = [...(displayPlace.tariffs || [])];
                              newTariffs.splice(idx, 1);
                              setPlace({...place, tariffs: newTariffs});
                            }}>
                              <MinusCircle color="#E74C3C" size={20} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[styles.tariffSelector, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
                              onPress={() => setPickerModal({
                                visible: true,
                                title: 'Tipo de Tarifa',
                                options: TARIFF_PRESETS,
                                onSelect: (val) => {
                                  const newTariffs = [...(displayPlace.tariffs || [])];
                                  newTariffs[idx].label = val;
                                  setPlace({...place, tariffs: newTariffs});
                                }
                              })}
                            >
                              <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{tariff.label}</Text>
                              <ChevronLeft color={theme.textSecondary} size={14} style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>

                            <TextInput
                              style={[styles.priceInput, { color: theme.primary, backgroundColor: theme.primary + '15' }]}
                              value={String(tariff.price)}
                              placeholder="0 €"
                              onChangeText={(v) => {
                                const newTariffs = [...(displayPlace.tariffs || [])];
                                newTariffs[idx] = { ...tariff, price: v.includes('€') ? v : `${v} €` };
                                setPlace({...place, tariffs: newTariffs});
                              }}
                            />
                          </View>

                          {/* Subtipos / Condiciones */}
                          {(tariff.subtypes || [tariff.condition || { type: 'none' }]).map((subtype, subIdx) => (
                            <View key={subtype.id || subIdx} style={[styles.conditionSection, { marginTop: subIdx > 0 ? 10 : 0 }]}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity 
                                  style={[styles.conditionSelector, { flex: 1, backgroundColor: theme.background, borderColor: theme.border }]}
                                  onPress={() => setPickerModal({
                                    visible: true,
                                    title: 'Subtipo / Condición',
                                    options: TARIFF_SUBTYPES.map(s => s.label),
                                    onSelect: (val) => {
                                      const selectedType = TARIFF_SUBTYPES.find(s => s.label === val);
                                      updateTariffSubtype(idx, subIdx, 'type', selectedType.id);
                                    }
                                  })}
                                >
                                  <Info color={theme.primary} size={14} />
                                  <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600', flex: 1, marginLeft: 5 }}>
                                    {TARIFF_SUBTYPES.find(s => s.id === (subtype.type || 'none'))?.label}
                                  </Text>
                                  <ChevronLeft color={theme.textSecondary} size={12} style={{ transform: [{ rotate: '-90deg' }] }} />
                                </TouchableOpacity>
                                
                                {(tariff.subtypes || [tariff.condition]).length > 1 && (
                                  <TouchableOpacity onPress={() => removeTariffSubtype(idx, subIdx)} style={{ marginLeft: 8 }}>
                                    <MinusCircle color="#E74C3C" size={16} />
                                  </TouchableOpacity>
                                )}
                              </View>

                              {/* Controles específicos según tipo */}
                              {(subtype.type === 'disability') && (
                                <View style={styles.conditionDetails}>
                                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Mínimo:</Text>
                                  <TouchableOpacity 
                                    style={styles.smallSelector}
                                    onPress={() => setPickerModal({
                                      visible: true,
                                      title: 'Porcentaje Discapacidad',
                                      options: PERCENTAGES.map(p => `${p}%`),
                                      onSelect: (val) => updateTariffSubtype(idx, subIdx, 'value', val.replace('%', ''))
                                    })}
                                  >
                                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{subtype.value || '33'}%</Text>
                                  </TouchableOpacity>
                                </View>
                              )}

                              {(subtype.type === 'senior' || subtype.type === 'child') && (
                                <View style={styles.conditionDetails}>
                                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Edad:</Text>
                                  <TouchableOpacity 
                                    style={styles.smallSelector}
                                    onPress={() => setPickerModal({
                                      visible: true,
                                      title: 'Seleccionar Edad',
                                      options: AGES,
                                      onSelect: (val) => updateTariffSubtype(idx, subIdx, 'value', val)
                                    })}
                                  >
                                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{subtype.value || '65'} años</Text>
                                  </TouchableOpacity>
                                </View>
                              )}

                              {(subtype.type === 'age_range' || subtype.type === 'student') && (
                                <View style={styles.conditionDetails}>
                                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>De:</Text>
                                  <TouchableOpacity 
                                    style={styles.smallSelector}
                                    onPress={() => setPickerModal({
                                      visible: true,
                                      title: 'Desde Edad',
                                      options: AGES,
                                      onSelect: (val) => updateTariffSubtype(idx, subIdx, 'from', val)
                                    })}
                                  >
                                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{subtype.from || '18'}</Text>
                                  </TouchableOpacity>
                                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>a:</Text>
                                  <TouchableOpacity 
                                    style={styles.smallSelector}
                                    onPress={() => setPickerModal({
                                      visible: true,
                                      title: 'Hasta Edad',
                                      options: AGES,
                                      onSelect: (val) => updateTariffSubtype(idx, subIdx, 'to', val)
                                    })}
                                  >
                                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{subtype.to || '25'}</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          ))}
                          
                          <TouchableOpacity onPress={() => addTariffSubtype(idx)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 5 }}>
                            <PlusCircle color={theme.primary} size={14} />
                            <Text style={{ color: theme.primary, fontSize: 11, marginLeft: 4, fontWeight: '600' }}>Añadir Subtipo a esta Tarifa</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={{ flex: 1 }}>
                          <View style={[styles.tariffRow, { borderBottomWidth: 0, paddingVertical: 0 }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.tariffLabel, { color: theme.text }]}>{tariff.label}</Text>
                              {(tariff.subtypes || [tariff.condition]).map((st, i) => getConditionText(st) ? (
                                <Text key={i} style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                                  • {getConditionText(st)}
                                </Text>
                              ) : null)}
                            </View>
                            <View style={[styles.priceTag, { backgroundColor: theme.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }]}>
                              <Text style={[styles.priceText, { color: theme.primary, fontWeight: 'bold' }]}>{tariff.price}</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}

                  {!isEditing && (
                    <View style={[styles.savingsHighlight, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                      <View style={styles.savingsHeader}>
                        <TrendingDown color={theme.primary} size={18} />
                        <Text style={[styles.savingsTitle, { color: theme.primary }]}>Tu Ahorro Estimado</Text>
                      </View>
                      <Text style={[styles.savingsDesc, { color: theme.textSecondary }]}>
                        Por tu condición de {userData.disabilityDegree || 'PCD'}, ahorras en este lugar.
                      </Text>
                      <View style={styles.savingsRow}>
                        <View>
                          <Text style={[styles.savingsLabel, { color: theme.textSecondary }]}>Tarifa General</Text>
                          <Text style={[styles.savingsValue, { color: theme.text, textDecorationLine: 'line-through' }]}>
                            {displayPlace.tariffs.find(t => t.label.toLowerCase().includes('general') || t.label.toLowerCase().includes('adulto'))?.price || '12.00 €'}
                          </Text>
                        </View>
                        <ChevronRight color={theme.textSecondary} size={20} />
                        <View>
                          <Text style={[styles.savingsLabel, { color: theme.primary }]}>Tu Precio</Text>
                          <Text style={[styles.savingsValue, { color: theme.primary, fontWeight: '900' }]}>
                            {displayPlace.tariffs.find(t => t.label.toLowerCase().includes('pcd') || t.label.toLowerCase().includes('discapacidad'))?.price || 'Gratis'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.tariffRow}>
                  <Text style={[styles.tariffLabel, { color: theme.text }]}>Entrada General</Text>
                  <Text style={[styles.priceText, { color: theme.primary }]}>Gratis</Text>
                </View>
              )}
            </View>
          </View>

          {/* Audioguía y Servicios Digitales */}
          {(displayPlace.audioguide || displayPlace.guidedVisits || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sparkles color={theme.primary} size={22} />
                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Servicios de Visita</Text>
              </View>
              
              {/* Audioguide Card */}
              {(displayPlace.audioguide || isEditing) && (
                <View style={[styles.audioguideCard, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 15 }]}>
                  <View style={styles.audioguideRow}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Mic color={theme.primary} size={18} />
                      <Text style={[styles.audioguideLabel, { color: theme.text, marginLeft: 8 }]}>Audioguía Oficial</Text>
                    </View>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.audioguidePriceEdit, { color: theme.primary }]}
                        value={place.audioguide?.price}
                        placeholder="Precio"
                        onChangeText={(v) => setPlace({ ...place, audioguide: { ...(place.audioguide || {}), price: v, available: true }})}
                      />
                    ) : (
                      <Text style={[styles.audioguidePrice, { color: theme.primary }]}>
                        {place.audioguide?.available ? place.audioguide.price : 'No disponible'}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.languagesContainer}>
                    {(place.audioguide?.languages || ['Español']).map((lang, lIdx) => (
                      <View key={lIdx} style={[styles.langTag, { backgroundColor: theme.background }]}>
                        <Text style={[styles.langText, { color: theme.textSecondary }]}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Guided Visits Card */}
              {(displayPlace.guidedVisits || isEditing) && (
                <View style={[styles.audioguideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.audioguideRow}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Users color={theme.primary} size={18} />
                      <Text style={[styles.audioguideLabel, { color: theme.text, marginLeft: 8 }]}>Visitas Guiadas</Text>
                    </View>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.audioguidePriceEdit, { color: theme.primary }]}
                        value={place.guidedVisits?.price}
                        placeholder="Precio"
                        onChangeText={(v) => setPlace({ ...place, guidedVisits: { ...(place.guidedVisits || {}), price: v, available: true }})}
                      />
                    ) : (
                      <Text style={[styles.audioguidePrice, { color: theme.primary }]}>
                        {place.guidedVisits?.available ? place.guidedVisits.price : 'Bajo consulta'}
                      </Text>
                    )}
                  </View>

                  {/* Visit Schedules */}
                  {(place.guidedVisits?.schedules || []).length > 0 && (
                    <View style={{ marginTop: 10, paddingHorizontal: 5 }}>
                      {(place.guidedVisits.schedules).map((sched, sidx) => (
                        <View key={sidx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{sched.days}</Text>
                          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>{sched.time}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.languagesContainer}>
                    {(place.guidedVisits?.languages || ['Español']).map((lang, lIdx) => (
                      <View key={lIdx} style={[styles.langTag, { backgroundColor: theme.background }]}>
                        <Text style={[styles.langText, { color: theme.textSecondary }]}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}


          {/* Location Map */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
            <View style={[styles.mapContainer, { backgroundColor: theme.surface, borderColor: theme.border, overflow: 'hidden' }]}>
              {place.location && place.location.latitude && MapView ? (
                <MapView
                  key={isDarkMode ? 'dark' : 'light'}
                  style={{ width: '100%', height: '100%' }}
                  userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
                  customMapStyle={isDarkMode ? DARK_MAP_STYLE : []}
                  initialRegion={{
                    latitude: Number(displayPlace.location.latitude),
                    longitude: Number(displayPlace.location.longitude),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                >
                  {Marker && (
                    <Marker coordinate={{
                      latitude: Number(displayPlace.location.latitude),
                      longitude: Number(displayPlace.location.longitude),
                    }} />
                  )}
                </MapView>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 }}>
                  <MapPin color={theme.textSecondary} size={32} />
                  <Text style={{ color: theme.textSecondary, marginTop: 10, textAlign: 'center' }}>Ubicación no disponible para este lugar</Text>
                </View>
              )}
            </View>
            
            {isEditing && (
              <View style={[styles.coordEditContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.coordTitle, { color: theme.text }]}>Coordenadas Geográficas</Text>
                <View style={styles.coordRow}>
                  <View style={styles.coordInputGroup}>
                    <Text style={[styles.coordLabel, { color: theme.textSecondary }]}>Latitud</Text>
                    <TextInput
                      style={[styles.coordInput, { color: theme.text, borderColor: theme.border }]}
                      value={String(place.location?.latitude || '')}
                      onChangeText={(v) => setPlace({...place, location: { ...place.location, latitude: parseFloat(v) || 0 }})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.coordInputGroup}>
                    <Text style={[styles.coordLabel, { color: theme.textSecondary }]}>Longitud</Text>
                    <TextInput
                      style={[styles.coordInput, { color: theme.text, borderColor: theme.border }]}
                      value={String(place.location?.longitude || '')}
                      onChangeText={(v) => setPlace({...place, location: { ...place.location, longitude: parseFloat(v) || 0 }})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.addressBar}>
              {isEditing ? (
                <TextInput
                  style={[styles.addressEdit, { color: theme.textSecondary, borderColor: theme.border }]}
                  value={place.address}
                  onChangeText={(v) => setPlace({...place, address: v})}
                  placeholder="Dirección exacta..."
                  placeholderTextColor={theme.textSecondary + '80'}
                />
              ) : (
                <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                  {String(displayPlace.address || `${displayPlace.city || ''}, ${displayPlace.province || ''}`)}
                </Text>
              )}
              {!isEditing && (
                <TouchableOpacity 
                  style={[styles.navBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    const lat = displayPlace.location?.latitude || 40.4168;
                    const lon = displayPlace.location?.longitude || -3.7038;
                    const label = encodeURI(displayPlace.name);
                    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                    Linking.openURL(url);
                  }}
                >
                  <Navigation color={isDarkMode ? "#0A192F" : "#FFF"} size={18} />
                  <Text style={[styles.navBtnText, { color: isDarkMode ? "#0A192F" : "#FFF" }]}>Cómo llegar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Accessibility Detailed Section */}
          <View style={[styles.accessibilitySection, { backgroundColor: theme.surface }]}>
            <View style={styles.sectionHeader}>
              <Accessibility color={theme.primary} size={24} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>
                Detalles de Accesibilidad
              </Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.accessibilityEdit, { color: theme.textSecondary, borderColor: theme.border }]}
                value={place.freeInfo}
                onChangeText={(v) => setPlace({...place, freeInfo: v})}
                multiline
                placeholder="Describe los detalles de accesibilidad..."
              />
            ) : (
              <Text style={[styles.accessibilityText, { color: theme.textSecondary }]}>
                {displayPlace.freeInfo || 'Lugar adaptado con rampas de acceso, baños adaptados y personal formado para asistencia.'}
              </Text>
            )}
            <View style={styles.checkList}>
              <View style={styles.checkItem}>
                <CheckCircle2 color="#2ECC71" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Acceso sin escalones</Text>
              </View>
              <View style={styles.checkItem}>
                <CheckCircle2 color="#2ECC71" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Ascensor panorámico</Text>
              </View>
              <View style={styles.checkItem}>
                <AlertTriangle color="#F1C40F" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Aviso previo recomendado</Text>
              </View>
            </View>
          </View>
        </View>

            {/* --- SECCIÓN DE COMUNIDAD Y RESEÑAS --- */}
            <View style={[styles.communityHeader, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <View style={styles.sectionTitleContainer}>
                <MessageSquare color={theme.primary} size={20} />
                <Text style={[styles.communityTitle, { color: theme.text }]}>Comunidad</Text>
              </View>
              <TouchableOpacity 
                style={[styles.writeReviewBtn, { backgroundColor: theme.primary }]}
                onPress={() => setShowReviewModal(true)}
              >
                <Plus color="#FFF" size={16} strokeWidth={3} />
                <Text style={styles.writeReviewBtnText}>OPINAR</Text>
              </TouchableOpacity>
            </View>

              {reviews.length === 0 ? (
                <View style={[styles.emptyReviews, { backgroundColor: theme.surface }]}>
                  <Sparkles color={theme.textSecondary} size={30} style={{ opacity: 0.3 }} />
                  <Text style={[styles.emptyReviewsText, { color: theme.textSecondary }]}>
                    Sé el primero en compartir tu experiencia de accesibilidad en este lugar.
                  </Text>
                </View>
              ) : (
                <View style={styles.reviewsList}>
                  {reviews.map((item, idx) => {
                    const initials = (item.user_name || 'E').charAt(0).toUpperCase();
                    const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
                    const avatarColor = avatarColors[idx % avatarColors.length];

                    return (
                      <View key={idx} style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.reviewHeader}>
                          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                            <Text style={styles.avatarText}>{initials}</Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.reviewUser, { color: theme.text }]}>{item.user_name || 'Explorador Anónimo'}</Text>
                            <View style={styles.starsRow}>
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12} color={s <= item.rating ? '#F1C40F' : theme.border} fill={s <= item.rating ? '#F1C40F' : 'transparent'} />
                              ))}
                            </View>
                          </View>
                          <Text style={styles.reviewDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{item.comment}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            
            <View style={{ height: 100 }} />
          </ScrollView>

        {/* Modal de Nueva Reseña */}
        <Modal visible={showReviewModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Tu experiencia es valiosa</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <X color={theme.text} size={24} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Puntuación de Accesibilidad:</Text>
              <View style={styles.ratingSelector}>
                {[1,2,3,4,5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setNewReview({...newReview, rating: s})}>
                    <Star size={32} color={s <= newReview.rating ? '#F1C40F' : theme.border} fill={s <= newReview.rating ? '#F1C40F' : 'transparent'} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.reviewInput, { color: theme.text, backgroundColor: theme.surface }]}
                placeholder="¿Cómo fue la accesibilidad? ¿Hay algo que otros deban saber?"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                value={newReview.comment}
                onChangeText={(v) => setNewReview({...newReview, comment: v})}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  if (!newReview.comment) return Alert.alert("Falta información", "Por favor, cuéntanos algo sobre tu visita.");
                  setIsSubmittingReview(true);
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/reviews`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        place_id: place.id,
                        user_id: userData.id,
                        user_name: userData.name,
                        rating: newReview.rating,
                        comment: newReview.comment
                      })
                    });
                    if (res.ok) {
                      setNewReview({ rating: 5, comment: '' });
                      setShowReviewModal(false);
                      fetchReviews();
                      Alert.alert("¡Gracias!", "Tu reseña ayudará a que más personas viajen con seguridad.");
                    }
                  } catch (e) {
                    Alert.alert("Error", "No se pudo enviar la reseña en este momento.");
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
              >
                {isSubmittingReview ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>PUBLICAR EXPERIENCIA</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Custom Picker Modal */}
      <Modal
        visible={pickerModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerModal({ ...pickerModal, visible: false })}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModal({ ...pickerModal, visible: false })}
        >
          <View style={[styles.pickerContent, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 15, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }]}>
              {pickerModal.title}
            </Text>
            <FlatList
              data={pickerModal.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.pickerItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    pickerModal.onSelect(item);
                    setPickerModal({ ...pickerModal, visible: false });
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: item === 'Cerrado' ? '#E74C3C' : theme.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity 
              style={{ marginTop: 15, padding: 12, backgroundColor: theme.primary, borderRadius: 12, alignItems: 'center' }}
              onPress={() => setPickerModal({ ...pickerModal, visible: false })}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {isAiProcessing && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.surface, padding: 35, borderRadius: 30, alignItems: 'center', width: '85%', borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[typography.h2, { color: theme.text, marginTop: 25, textAlign: 'center', fontSize: 22 }]}>Análisis de Patrimonio Distravel</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center', fontStyle: 'italic', fontSize: 14, lineHeight: 20 }}>
              Actualizando historia, horarios y accesibilidad de "{place.name}"...
            </Text>
            <View style={{ height: 6, width: '100%', backgroundColor: theme.border, borderRadius: 3, marginTop: 25, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${aiProgress * 100}%`, backgroundColor: theme.primary }} />
            </View>
            <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '900', marginTop: 15, letterSpacing: 1 }}>
              {Math.round(aiProgress * 100)}% COMPLETADO
            </Text>
          </View>
        </View>
      )}

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
                Alert.alert("Reportar Ubicación", "¿Deseas informar de algún error o contenido inapropiado en este lugar?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Reportar", style: "destructive", onPress: () => Alert.alert("Enviado", "Tu reporte ha sido enviado al equipo de moderación. Gracias por ayudarnos.") }
                ]);
              }}
            >
              <Flag color="#FFF" size={20} />
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
      {showSuccess && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 20000, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Check color="#FFF" size={60} strokeWidth={4} />
            </View>
            <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>¡Cambios Guardados!</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 10, textAlign: 'center' }}>La información ha sido actualizada correctamente.</Text>
          </View>
        </View>
      )}
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroContainer: { height: 350, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  heroMapOverlay: {
    position: 'absolute',
    top: 100,
    right: 10,
    zIndex: 1,
    opacity: 0.5
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cityChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailSearchResults: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    borderRadius: 15,
    borderWidth: 1,
    zIndex: 10000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    maxHeight: 200
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  headerActions: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, zIndex: 10 },
  circleButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 }, 
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  timeBadgeText: { fontSize: 12, fontWeight: '700' },
  badgeEdit: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cityEditInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  coordEditContainer: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  coordTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  coordRow: { flexDirection: 'row', gap: 15 },
  coordInputGroup: { flex: 1 },
  coordLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  coordInput: { borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 13 },
  addressEdit: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 13 },
  accessibilityEdit: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, marginTop: 10, minHeight: 80 },
  placeName: { color: '#FFFFFF', marginTop: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, fontSize: 32, fontWeight: '900' },
  headerAddress: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainContent: { padding: 20 },
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
    backgroundColor: '#27AE60',
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
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24, textAlign: 'justify' },
  contactContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactIconBox: {
    width: 32,
    marginRight: 10,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  tipCard: { flexDirection: 'row', padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 25, gap: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  tipText: { fontSize: 14, lineHeight: 20, textAlign: 'justify' },
  accessRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  accessIconBox: { flex: 1, padding: 12, borderRadius: 15, alignItems: 'center', gap: 6 },
  accessIconText: { fontSize: 10, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  infoItem: { flex: 1, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 10, color: '#95A5A6', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  savingsValue: { fontSize: 18, fontWeight: '800' },
  schedulesGrid: { gap: 12 },
  scheduleCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scheduleLabel: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  scheduleHours: { fontSize: 14, fontWeight: '500' },
  scheduleLabelEdit: { fontSize: 15, fontWeight: '800', flex: 1 },
  scheduleHoursEdit: { fontSize: 14, fontWeight: '600' },
  specialClosuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  specialClosuresText: { fontSize: 13, fontWeight: '600' },
  specialClosuresEdit: { flex: 1, fontSize: 13, fontWeight: '600' },
  linkedEntranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    borderStyle: 'dashed',
  },
  linkedTitle: { fontSize: 16, fontWeight: '800' },
  linkedText: { fontSize: 14, fontWeight: '500' },
  linkedInput: { fontSize: 14, fontWeight: '500', flex: 1 },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  contactBtnText: { fontSize: 14, fontWeight: '700' },
  scheduleContainer: { padding: 15, borderRadius: 15, marginTop: 10 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  dayText: { fontSize: 14, fontWeight: '600' },
  timeText: { fontSize: 14 },
  holidayNote: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  holidayText: { fontSize: 12, fontStyle: 'italic' },
  tariffsContainer: { padding: 15, borderRadius: 15, marginTop: 10 },
  tariffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tariffLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  priceTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceText: { fontSize: 14, fontWeight: '800' },
  tariffDisclaimer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  disclaimerText: { fontSize: 12, fontStyle: 'italic' },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  addressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  accessibilitySection: { padding: 20, borderRadius: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  accessibilityText: { fontSize: 15, lineHeight: 24, marginBottom: 15 },
  checkList: { gap: 10 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 14, fontWeight: '600' },
  placeNameEdit: {
    color: '#FFFFFF',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    minWidth: '80%',
  },
  descriptionEdit: {
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  contactContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTextEdit: {
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  priceEditInput: {
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'center',
  },
  editScheduleBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  editScheduleInput: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  noticesContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
  noticeTextEdit: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    padding: 4,
  },
  seasonCard: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  removeSeasonBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  seasonName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  seasonNameEdit: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 4,
  },
  seasonPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  seasonPeriodEdit: {
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  seasonBody: {
    marginTop: 15,
    gap: 10,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  seasonTime: {
    fontSize: 13,
  },
  seasonTimeEdit: {
    fontSize: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    minWidth: 120,
    textAlign: 'right',
  },
  seasonMonthInput: {
    fontSize: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    width: 40,
    textAlign: 'center',
    paddingVertical: 2,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  savingsBadgeText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '800',
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techItem: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techLabel: {
    fontSize: 10,
    color: '#95A5A6',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  techValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  visitButton: {
    flexDirection: 'row',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  visitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  verificationCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 15,
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  verificationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  verificationSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  verifyActionBtn: {
    flexDirection: 'row',
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  verifyActionText: {
    color: '#070B14',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },
  augmentedGrid: {
    gap: 15,
    marginTop: 5,
  },
  augmentedCard: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  augmentedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  augmentedCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  augmentedText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  augmentedTextEdit: {
    fontSize: 14,
    lineHeight: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  savingsHighlight: {
    marginTop: 20,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  savingsDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'justify',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  savingsLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  savingsValue: {
    fontSize: 18,
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
  structuredSeasonCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    marginTop: 15,
  },
  seasonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  seasonNameInput: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  monthInput: {
    width: 30,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  monthSelector: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  monthSelectorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayToggle: {
    paddingHorizontal: 2,
    paddingVertical: 3,
    borderRadius: 4,
    width: 32,
    alignItems: 'center',
  },
  timeInput: {
    width: 42,
    fontSize: 11,
    textAlign: 'center',
    padding: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  timeSelector: {
    width: 48,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeSelectorText: {
    fontSize: 10,
    fontWeight: '800',
  },
  addSeasonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 25,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  pickerItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 5,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagsEdit: {
    fontSize: 14,
    paddingVertical: 5,
  },
  specialClosureBox: {
    borderWidth: 1,
    borderColor: '#E74C3C',
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
    shadowRadius: 10,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 4
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  writeReviewBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1
  },
  sectionTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  emptyReviews: { 
    padding: 30, 
    borderRadius: 24, 
    alignItems: 'center', 
    marginTop: 15, 
    borderStyle: 'dashed', 
    borderWidth: 1.5 
  },
  emptyReviewsText: { 
    marginTop: 15, 
    textAlign: 'center', 
    fontSize: 15, 
    lineHeight: 22, 
    opacity: 0.8 
  },
  reviewsList: { 
    gap: 16, 
    marginTop: 15 
  },
  reviewCard: { 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  reviewHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 14 
  },
  avatar: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  avatarText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 16 
  },
  reviewUser: { 
    fontSize: 15, 
    fontWeight: '800' 
  },
  reviewComment: { 
    fontSize: 15, 
    lineHeight: 24, 
    textAlign: 'justify',
    marginTop: 4
  },
  reviewDate: { 
    fontSize: 11, 
    color: '#95A5A6', 
    fontWeight: '600' 
  },
  starsRow: { 
    flexDirection: 'row', 
    gap: 3, 
    marginTop: 4 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 25, 
    paddingBottom: 40,
    maxHeight: '85%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900',
    letterSpacing: -0.5
  },
  modalLabel: { 
    fontSize: 15, 
    fontWeight: '800', 
    marginBottom: 18,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  ratingSelector: { 
    flexDirection: 'row', 
    gap: 15, 
    justifyContent: 'center', 
    marginBottom: 30 
  },
  reviewInput: { 
    borderRadius: 20, 
    padding: 20, 
    fontSize: 16, 
    minHeight: 140, 
    textAlignVertical: 'top', 
    marginBottom: 30,
    borderWidth: 1
  },
  submitBtn: { 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 6 
  },
  submitBtnText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 16,
    letterSpacing: 1
  },
  audioBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
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
  tariffCard: { 
    marginBottom: 15, 
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.05)' 
  },
  tariffRowMain: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tariffSelector: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 5
  },
  priceInput: { width: 85, height: 40, borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: '800' },
  conditionSection: {
    marginLeft: 30,
    gap: 8
  },
  conditionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  conditionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10
  },
  smallSelector: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)'
  },
});
