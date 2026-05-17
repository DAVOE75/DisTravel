import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  ActivityIndicator,
  StatusBar,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import * as LucideIcons from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Normalización de iconos para evitar "Render Error"
const getIcon = (name) => LucideIcons[name]?.default || LucideIcons[name] || LucideIcons.Info;

const ChevronLeft = getIcon('ChevronLeft');
const Camera = getIcon('Camera');
const MapPin = getIcon('MapPin');
const Clock = getIcon('Clock');
const CreditCard = getIcon('CreditCard');
const PlusCircle = getIcon('PlusCircle');
const MinusCircle = getIcon('MinusCircle');
const X = getIcon('X');
const Save = getIcon('Save');
const Zap = getIcon('Zap');
const Info = getIcon('Info');
const Building2 = getIcon('Building2');
const LinkIcon = getIcon('Link');
const Search = getIcon('Search');
const Check = getIcon('Check');
const LayoutGrid = getIcon('LayoutGrid');
const Smartphone = getIcon('Smartphone');
const Globe = getIcon('Globe');
const Tag = getIcon('Tag');
const AlertTriangle = getIcon('AlertTriangle');
const Headphones = getIcon('Headphones');
const Users = getIcon('Users');
const Ruler = getIcon('Ruler');
const Accessibility = getIcon('Accessibility');
const Eye = getIcon('Eye');
const Ear = getIcon('Ear');
const Brain = getIcon('Brain');
const CheckCircle2 = getIcon('CheckCircle2');
const List = getIcon('List');
const Construction = getIcon('Construction');
const Sparkles = getIcon('Sparkles');
const Phone = getIcon('Phone');
import * as ImagePicker from 'expo-image-picker';
// Importación segura de react-native-maps
let MapViewRaw, MarkerRaw;
try {
  const Maps = require('react-native-maps');
  MapViewRaw = Maps.default || Maps;
  MarkerRaw = Maps.Marker;
} catch (e) {
  console.warn('react-native-maps no disponible en AddLocationScreen');
}

const MapView = MapViewRaw;
const Marker = MarkerRaw;
import { typography } from '../theme/typography';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { GeminiService } from '../utils/gemini';
import MUNICIPIOS_DATA from '../data/municipios.json';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CATEGORIES = [
  'Museo', 'Iglesia', 'Parque', 'Restaurante', 'Hotel', 'Atracción'
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
const AGES = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

export default function AddLocationScreen({ navigation, route }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData } = useUser();
  const rawInsets = useSafeAreaInsets();
  const insets = rawInsets || { top: 0, bottom: 0, left: 0, right: 0 };
  const scrollRef = useRef(null);
  const defaultCity = route.params?.defaultCity || '';

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [datePickerState, setDatePickerState] = useState({ visible: false, seasonIdx: null, field: null, value: new Date() });
  const [showSuccess, setShowSuccess] = useState(false);
  const mapRef = useRef(null);

  const centerMap = (lat, lon) => {
    if (mapRef.current && !isNaN(lat) && !isNaN(lon)) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const isValidLocation = (loc) => {
    return loc && !isNaN(loc.latitude) && !isNaN(loc.longitude);
  };

  const [formData, setFormData] = useState({
    name: '',
    city: defaultCity,
    category: 'Museo',
    description: '',
    touristTip: '',
    address: '',
    website: '',
    phone: '',
    tags: '',
    image: null,
    location: { latitude: 40.4168, longitude: -3.7038 },
    structuredSchedules: [],
    tariffs: [
      { 
        id: '1', 
        label: 'Entrada General', 
        price: '15.00 €',
        subtypes: [{ id: 'sub-1', type: 'none', value: '', from: '', to: '' }]
      },
      { 
        id: '2', 
        label: 'Entrada Gratuita', 
        price: '0 €',
        subtypes: [{ id: 'sub-2', type: 'disability', value: '33', from: '', to: '' }]
      }
    ],
    specialClosures: '',
    criticalNotices: [],
    isLinkedEntrance: false,
    linkedEntranceName: '',
    additionalInfo: '',
    additionalServices: {
      audioguide: { enabled: false, price: '0', freeForDisabled: false },
      guidedVisits: { enabled: false, price: '0', freeForDisabled: false }
    },
    accessibility: {
      physical: true,
      visual: false,
      auditory: false,
      cognitive: false
    },
    technicalSpecs: {
      doorWidth: '',
      elevatorMeasures: '',
      adaptedToilet: false,
      magneticLoop: false,
      braille: false,
      accessibleParking: false,
      wheelchairRental: false
    }
  });

  // Efecto para geolocalizar cuando cambia la dirección (si no es un cambio manual del mapa)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.address && formData.address.length > 5) {
        try {
          const query = encodeURIComponent(`${formData.address}, ${formData.city}, Spain`);
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
            headers: { 'User-Agent': 'DistravelApp/1.0' }
          });
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            if (!isNaN(lat) && !isNaN(lon)) {
              setFormData(prev => ({
                ...prev,
                location: { latitude: lat, longitude: lon }
              }));
              centerMap(lat, lon);
            }
          }
        } catch (e) {
          console.warn('Error en geolocalización:', e);
        }
      }
    }, 2000); // Debounce de 2 segundos para no saturar la API

    return () => clearTimeout(timer);
  }, [formData.address, formData.city]);

  const [searchQuery, setSearchQuery] = useState(defaultCity);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [pickerModal, setPickerModal] = useState({
    visible: false,
    type: '',
    title: '',
    options: [],
    onSelect: () => {}
  });

  const [placesInCity, setPlacesInCity] = useState([]);
  
  useEffect(() => {
    if (formData.city || formData.cityName) {
      const city = formData.city || formData.cityName;
      fetch(`${API_BASE_URL}/api/places?city=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
               const placeNames = data.data.map(p => p.name).filter(n => n !== formData.name);
               setPlacesInCity(placeNames.length > 0 ? placeNames : ['MARQ', 'LUCENTUM', 'LA ILLETA']);
            }
        })
        .catch(() => {
           const localPlaces = (userData.contributions || [])
             .filter(p => (p.city === city || p.cityName === city) && p.name !== formData.name)
             .map(p => p.name);
           setPlacesInCity(localPlaces.length > 0 ? localPlaces : ['MARQ', 'LUCENTUM', 'LA ILLETA']);
        });
    }
  }, [formData.city, formData.cityName, formData.name, userData.contributions]);

  const handleAiEnhance = async () => {
    if (!formData.name || !formData.city) {
      Alert.alert('Información insuficiente', 'Por favor, introduce el nombre del lugar y el municipio para que la IA pueda investigar.');
      return;
    }

    setIsAiLoading(true);
    Keyboard.dismiss();
    setAiProgress(0);
    const progressInterval = setInterval(() => {
      setAiProgress(prev => (prev < 0.9 ? prev + 0.05 : prev));
    }, 150);

    try {
      const aiData = await GeminiService.getPlaceData(formData.name, formData.city, userData.aiApiKey, formData.category);
      clearInterval(progressInterval);
      setAiProgress(1);

      if (aiData) {
        setFormData(prev => {
          const newState = {
            ...prev,
            description: (typeof aiData.description === 'object' ? JSON.stringify(aiData.description) : (aiData.description || prev.description)),
            history: (typeof aiData.history === 'object' ? JSON.stringify(aiData.history) : (aiData.history || prev.history)),
            address: aiData.address || prev.address,
            phone: aiData.phone || prev.phone,
            website: aiData.website || prev.website,
            touristTip: aiData.touristTip || prev.touristTip,
            tags: aiData.tags || prev.tags,
            criticalNotices: aiData.criticalNotices || prev.criticalNotices,
            location: aiData.location || prev.location,
            structuredSchedules: aiData.schedules ? aiData.schedules.map((s, i) => {
              const days = {};
              [1, 2, 3, 4, 5].forEach(d => {
                days[d] = { isOpen: true, mOpen: s.weekday?.split(' - ')?.[0] || '10:00', mClose: s.weekday?.split(' - ')?.[1] || '18:00', aOpen: '', aClose: '' };
              });
              [6, 0].forEach(d => {
                days[d] = { isOpen: s.weekend?.toLowerCase() !== 'cerrado', mOpen: s.weekend?.split(' - ')?.[0] || '10:00', mClose: s.weekend?.split(' - ')?.[1] || '14:00', aOpen: '', aClose: '' };
              });
              return { id: String(Date.now() + i), name: s.name || 'Temporada Única', period: s.period || 'Todo el año', days: days, isEnabled: true };
            }) : prev.structuredSchedules,
            tariffs: aiData.tariffs ? aiData.tariffs.map((t, i) => ({
              id: String(Date.now() + i + 10), preset: t.preset || 'Otros / Personalizado', label: t.label, price: t.price.includes('€') ? t.price : `${t.price} €`, subtypes: [{ id: `sub-${Date.now()}-${i}`, type: 'none', value: '', from: '', to: '' }]
            })) : prev.tariffs,
            additionalServices: aiData.services ? {
              audioguide: { enabled: aiData.services.audioguide?.has || false, price: aiData.services.audioguide?.price || '0', freeForDisabled: aiData.services.audioguide?.isFreePCD || false },
              guidedVisits: { enabled: aiData.services.guidedVisits?.has || false, price: aiData.services.guidedVisits?.price || '0', freeForDisabled: aiData.services.guidedVisits?.isFreePCD || false }
            } : prev.additionalServices,
            technicalSpecs: aiData.technicalSpecs ? { ...prev.technicalSpecs, ...aiData.technicalSpecs } : prev.technicalSpecs,
            accessibility: aiData.accessibility ? {
              physical: aiData.accessibility.physical ?? prev.accessibility.physical,
              visual: aiData.accessibility.visual ?? prev.accessibility.visual,
              auditory: aiData.accessibility.hearing ?? aiData.accessibility.auditory ?? prev.accessibility.auditory,
              cognitive: aiData.accessibility.cognitive ?? prev.accessibility.cognitive,
              details: aiData.accessibility.details || prev.accessibility.details
            } : prev.accessibility
          };

          if (aiData.location) {
            setTimeout(() => centerMap(aiData.location.latitude, aiData.location.longitude), 300);
          }
          
          return newState;
        });
        
        if (GeminiService.isRevoked || (GeminiService.lastError && GeminiService.lastError.includes('API key not valid'))) {
          Alert.alert(
            '🔑 Error de Autenticación', 
            'La clave de API de Gemini no es válida o ha sido revocada. Para usar la IA real, por favor introduce tu propia clave en Configuración > Servicios de IA.',
            [{ text: 'Ir a Configuración', onPress: () => navigation.navigate('Settings') }, { text: 'Cerrar', style: 'cancel' }]
          );
        } else if (aiData.isFamous) {
          Alert.alert('🏛️ Patrimonio Detectado', `Hemos recuperado los datos oficiales y técnicos de ${formData.name} desde nuestra base de datos local verificada.`);
        } else if (aiData.isMock) {
          Alert.alert(
            '⚠️ Usando Datos Estimados', 
            'No se pudo conectar con la IA real (posible error de clave o conexión). Los datos mostrados son estimaciones locales. Por favor, configura tu propia API Key en Ajustes para precisión total.',
            [{ text: 'Entendido' }]
          );
        } else {
          Alert.alert('¡IA Completada!', `Se han rellenado los datos de ${formData.name} automáticamente con información real.`);
        }
      } else {
        const errorMsg = GeminiService.lastError ? `\nDetalle: ${GeminiService.lastError}` : '';
        Alert.alert('IA no disponible', `No se ha podido obtener información. Verifica tu API Key en Configuración.${errorMsg}`);
      }
    } catch (error) {
      console.error('AI Enhance Error:', error);
      Alert.alert('Error', 'Hubo un problema al consultar a la IA.');
    } finally {
      setIsAiLoading(false);
      clearInterval(progressInterval);
    }
  };

  // Municipios local search (fallback)
  const performLocalSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    const normQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const filtered = MUNICIPIOS_DATA.filter(m => 
      m.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normQuery)
    ).slice(0, 5);
    setSearchResults(filtered);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.4, // Calidad optimizada para subida rápida
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      
      // Upload to server
      setIsUploading(true);
      const controller = new AbortController();
      
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('image', {
          uri: newUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });

        // Promise.race para asegurar que el timeout funcione pase lo que pase
        const uploadPromise = fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formDataUpload,
          // IMPORTANTE: Dejar que fetch ponga el boundary automático
          signal: controller.signal
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            controller.abort();
            reject(new Error('Timeout de subida'));
          }, 60000)
        );

        const response = await Promise.race([uploadPromise, timeoutPromise]);
        
        const data = await response.json();
        if (data.success) {
          const finalImageUrl = `${API_BASE_URL}${data.url}`;
          setFormData(prev => ({ ...prev, image: finalImageUrl }));
        } else {
          throw new Error('Servidor rechazó imagen');
        }
      } catch (error) {
        console.warn('Subida fallida o lenta, usando local:', error.message);
        // Fallback inmediato al URI local para que el usuario no espere más
        setFormData(prev => ({ ...prev, image: newUri }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddSeason = () => {
    const newSeason = {
      id: Date.now().toString(),
      name: formData.structuredSchedules.length === 0 ? 'Horario General' : 'Nueva Temporada',
      startDate: '',
      endDate: '',
      period: 'Todo el año',
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
    setFormData(prev => ({ ...prev, structuredSchedules: [...prev.structuredSchedules, newSeason] }));
  };

  const handleAddCriticalNotice = () => {
    setFormData(prev => ({
      ...prev,
      criticalNotices: [...(prev.criticalNotices || []), '']
    }));
  };

  const updateCriticalNotice = (index, text) => {
    setFormData(prev => {
      const newNotices = [...(prev.criticalNotices || [])];
      newNotices[index] = text;
      return { ...prev, criticalNotices: newNotices };
    });
  };

  const removeCriticalNotice = (index) => {
    setFormData(prev => {
      const newNotices = [...(prev.criticalNotices || [])];
      newNotices.splice(index, 1);
      return { ...prev, criticalNotices: newNotices };
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.city) {
      Alert.alert('Faltan datos', 'Por favor, introduce el nombre del lugar y la ciudad.');
      return;
    }

    setIsLoading(true);
    try {
      const placeId = `custom-${Date.now()}`;
      const newPlace = {
        ...formData,
        id: placeId,
        isUserAdded: true,
        verified: false,
        verifiedStatus: 'Pendiente',
        rating: 5.0,
        createdAt: new Date().toISOString()
      };

      // Guardar en el contexto local inmediatamente
      updateUserData('contributions', (prev) => [newPlace, ...(prev || [])]);
      
      // Intentar subir al servidor de forma asíncrona
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de gracia
      
      try {
        const extraData = {
          structuredSchedules: newPlace.structuredSchedules,
          technicalSpecs: newPlace.technicalSpecs,
          criticalNotices: newPlace.criticalNotices,
          tariffs: newPlace.tariffs,
          isLinkedEntrance: newPlace.isLinkedEntrance,
          linkedEntranceName: newPlace.linkedEntranceName,
          touristTip: newPlace.touristTip,
          accessibility: newPlace.accessibility,
          additionalServices: newPlace.additionalServices,
          specialClosures: newPlace.specialClosures,
          tags: newPlace.tags,
          verifiedStatus: newPlace.verifiedStatus
        };

        const serverBody = {
          id: placeId,
          name: newPlace.name,
          city: newPlace.city,
          category: newPlace.category,
          address: newPlace.address,
          phone: newPlace.phone,
          website: newPlace.website,
          image: newPlace.image,
          latitude: newPlace.location?.latitude,
          longitude: newPlace.location?.longitude,
          extra_data: extraData
        };

        await fetch(`${API_ENDPOINTS.PLACES}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serverBody),
          signal: controller.signal
        });
      } catch (e) {
        console.warn('Sincronización en segundo plano falló, datos guardados localmente');
      } finally {
        clearTimeout(timeoutId);
      }

      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el guardado.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccessibility = (key) => {
    setFormData(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: !prev.accessibility[key]
      }
    }));
  };

  const toggleService = (key) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [key]: {
          ...prev.additionalServices[key],
          enabled: !prev.additionalServices[key].enabled
        }
      }
    }));
  };

  const updateServiceDetail = (serviceKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [serviceKey]: {
          ...prev.additionalServices[serviceKey],
          [field]: value
        }
      }
    }));
  };

  const toggleTechnical = (key) => {
    setFormData(prev => ({
      ...prev,
      technicalSpecs: {
        ...prev.technicalSpecs,
        [key]: !prev.technicalSpecs[key]
      }
    }));
  };

  const updateTechnical = (key, value) => {
    setFormData(prev => ({
      ...prev,
      technicalSpecs: {
        ...prev.technicalSpecs,
        [key]: value
      }
    }));
  };

  const updateTariffSubtype = (idx, subIdx, field, value) => {
    setFormData(prev => {
      const newTariffs = [...prev.tariffs];
      const newSubtypes = [...(newTariffs[idx].subtypes || [])];
      newSubtypes[subIdx] = {
        ...newSubtypes[subIdx],
        [field]: value
      };
      newTariffs[idx] = {
        ...newTariffs[idx],
        subtypes: newSubtypes
      };
      return { ...prev, tariffs: newTariffs };
    });
  };

  const addTariffSubtype = (idx) => {
    setFormData(prev => {
      const newTariffs = [...prev.tariffs];
      const newSubtypes = [...(newTariffs[idx].subtypes || [])];
      newSubtypes.push({ id: `sub-${Date.now()}`, type: 'none', value: '', from: '', to: '' });
      newTariffs[idx] = {
        ...newTariffs[idx],
        subtypes: newSubtypes
      };
      return { ...prev, tariffs: newTariffs };
    });
  };

  const removeTariffSubtype = (idx, subIdx) => {
    setFormData(prev => {
      const newTariffs = [...prev.tariffs];
      const newSubtypes = [...(newTariffs[idx].subtypes || [])];
      if (newSubtypes.length > 1) {
        newSubtypes.splice(subIdx, 1);
        newTariffs[idx] = {
          ...newTariffs[idx],
          subtypes: newSubtypes
        };
      }
      return { ...prev, tariffs: newTariffs };
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Añadir Nuevo Lugar</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
          {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Save color="#FFF" size={20} />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollRef}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Image Picker */}
          <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]} disabled={isUploading}>
            {isUploading ? (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Subiendo imagen...</Text>
              </View>
            ) : formData.image ? (
              <Image source={{ uri: formData.image }} style={styles.pickedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color={theme.textSecondary} size={40} />
                <Text style={{ color: theme.textSecondary, marginTop: 10, fontWeight: '700' }}>Añadir Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Información General */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <List color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Información General</Text>
            </View>

            <View style={styles.inputContainer}>
              <Building2 color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Nombre del monumento o lugar"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(v) => setFormData(prev => ({ ...prev, name: v }))}
              />
              <TouchableOpacity 
                style={styles.inputEndIcon} 
                onPress={handleAiEnhance}
                disabled={isAiLoading}
              >
                {isAiLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Sparkles color={theme.primary} size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={{ position: 'relative', zIndex: 100 }}>
              <View style={[styles.inputContainer, { marginTop: 15 }]}>
                <MapPin color={theme.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Ciudad o Municipio"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.city}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({ y: 280, animated: true });
                    }, 100);
                  }}
                  onChangeText={(v) => {
                    setFormData(prev => ({ ...prev, city: v }));
                    setSearchQuery(v);
                    performLocalSearch(v);
                    setShowSearchResults(v.length > 1);
                    if (v.length > 1) {
                      scrollRef.current?.scrollTo({ y: 280, animated: true });
                    }
                  }}
                />
              </View>
              {showSearchResults && searchResults.length > 0 && (
                <View style={[styles.searchResults, { backgroundColor: theme.surface, borderColor: theme.border, top: 65 }]}>
                  {searchResults.map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.searchItem, { borderBottomWidth: idx === searchResults.length - 1 ? 0 : 0.5, borderBottomColor: theme.border }]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, city: item.label }));
                        setSearchQuery(item.label);
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

            <View style={[styles.inputContainer, { marginTop: 15 }]}>
              <Info color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Descripción del lugar (Historia, qué ver...)"
                placeholderTextColor={theme.textSecondary}
                value={formData.description}
                onChangeText={(v) => setFormData(prev => ({ ...prev, description: v }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={[styles.inputContainer, { marginTop: 15 }]}>
              <Zap color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Tip Turístico (Mejor hora, qué no perderse...)"
                placeholderTextColor={theme.textSecondary}
                value={formData.touristTip}
                onChangeText={(v) => setFormData(prev => ({ ...prev, touristTip: v }))}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={[styles.inputContainer, { marginTop: 15 }]}>
              <MapPin color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Dirección exacta (Calle, número...)"
                placeholderTextColor={theme.textSecondary}
                value={formData.address}
                onChangeText={(v) => setFormData(prev => ({ ...prev, address: v }))}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputContainer, { flex: 1, marginTop: 15 }]}>
                <Globe color={theme.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Web oficial"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.website}
                  onChangeText={(v) => setFormData(prev => ({ ...prev, website: v }))}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginTop: 15, marginLeft: 10 }]}>
                <Smartphone color={theme.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Teléfono"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.phone}
                  onChangeText={(v) => setFormData(prev => ({ ...prev, phone: v }))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={[styles.inputContainer, { marginTop: 15 }]}>
              <Tag color={theme.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Etiquetas (separadas por comas)"
                placeholderTextColor={theme.textSecondary}
                value={formData.tags}
                onChangeText={(v) => setFormData(prev => ({ ...prev, tags: v }))}
              />
            </View>

            <View style={styles.categoryContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity 
                    key={cat}
                    style={[
                      styles.categoryButton, 
                      { backgroundColor: formData.category === cat ? theme.primary : theme.surface, borderColor: theme.border }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                  >
                    <Text style={[styles.categoryText, { color: formData.category === cat ? '#FFF' : theme.text }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Accesibilidad Adaptada */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Accessibility color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Accesibilidad Adaptada</Text>
            </View>

            <View style={styles.accessibilityGrid}>
              <TouchableOpacity 
                style={[styles.accessCard, { backgroundColor: formData.accessibility.physical ? theme.primary : theme.surface, borderColor: theme.border }]}
                onPress={() => toggleAccessibility('physical')}
              >
                <MapPin color={formData.accessibility.physical ? '#FFF' : theme.primary} size={32} />
                <Text style={[styles.accessLabel, { color: formData.accessibility.physical ? '#FFF' : theme.text }]}>Física</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.accessCard, { backgroundColor: formData.accessibility.visual ? theme.primary : theme.surface, borderColor: theme.border }]}
                onPress={() => toggleAccessibility('visual')}
              >
                <Eye color={formData.accessibility.visual ? '#FFF' : theme.primary} size={32} />
                <Text style={[styles.accessLabel, { color: formData.accessibility.visual ? '#FFF' : theme.text }]}>Visual</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.accessCard, { backgroundColor: formData.accessibility.auditory ? theme.primary : theme.surface, borderColor: theme.border }]}
                onPress={() => toggleAccessibility('auditory')}
              >
                <Ear color={formData.accessibility.auditory ? '#FFF' : theme.primary} size={32} />
                <Text style={[styles.accessLabel, { color: formData.accessibility.auditory ? '#FFF' : theme.text }]}>Auditiva</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.accessCard, { backgroundColor: formData.accessibility.cognitive ? theme.primary : theme.surface, borderColor: theme.border }]}
                onPress={() => toggleAccessibility('cognitive')}
              >
                <Brain color={formData.accessibility.cognitive ? '#FFF' : theme.primary} size={32} />
                <Text style={[styles.accessLabel, { color: formData.accessibility.cognitive ? '#FFF' : theme.text }]}>Cognitiva</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ubicación Geográfica */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Ubicación Geográfica</Text>
            </View>
            <View style={[styles.mapContainer, { borderColor: theme.border }]}>
              {MapView ? (
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: !isNaN(formData.location?.latitude) ? formData.location.latitude : 40.4168,
                    longitude: !isNaN(formData.location?.longitude) ? formData.location.longitude : -3.7038,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onRegionChangeComplete={(region) => {
                    if (!isNaN(region.latitude) && !isNaN(region.longitude)) {
                      setFormData(prev => ({
                        ...prev,
                        location: { latitude: region.latitude, longitude: region.longitude }
                      }));
                    }
                  }}
                >
                  {isValidLocation(formData.location) && Marker && (
                    <Marker coordinate={formData.location} />
                  )}
                </MapView>
              ) : (
                <View style={{ height: 200, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: theme.textSecondary }}>Mapa no disponible</Text>
                </View>
              )}
              <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayText}>Mueve el mapa para ajustar el pin en la entrada principal.</Text>
              </View>
            </View>
          </View>

          {/* Horarios */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Configuración de Horarios</Text>
              <TouchableOpacity onPress={handleAddSeason} style={styles.addBtn}>
                <PlusCircle color={theme.primary} size={24} />
              </TouchableOpacity>
            </View>

            {formData.structuredSchedules.map((season, sIdx) => (
              <View key={sIdx} style={[styles.seasonCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.seasonHeaderRow}>
                  <TextInput 
                    style={[styles.seasonNameInput, { color: theme.primary }]}
                    value={season.name}
                    onChangeText={(v) => {
                      const newSchedules = [...formData.structuredSchedules];
                      newSchedules[sIdx].name = v;
                      setFormData(prev => ({ ...prev, structuredSchedules: newSchedules }));
                    }}
                  />
                  <TouchableOpacity onPress={() => {
                    const newSchedules = [...formData.structuredSchedules];
                    newSchedules.splice(sIdx, 1);
                    setFormData(prev => ({ ...prev, structuredSchedules: newSchedules }));
                  }}>
                    <X color="#E74C3C" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Desde:</Text>
                  <TouchableOpacity 
                    style={[styles.selector, { borderColor: theme.border, backgroundColor: theme.background, flex: 1 }]}
                    onPress={() => setDatePickerState({
                      visible: true,
                      seasonIdx: sIdx,
                      field: 'startDate',
                      value: season.startDate ? new Date(season.startDate) : new Date()
                    })}
                  >
                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>
                      {season.startDate ? season.startDate.split('-').reverse().join('/') : 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Hasta:</Text>
                  <TouchableOpacity 
                    style={[styles.selector, { borderColor: theme.border, backgroundColor: theme.background, flex: 1 }]}
                    onPress={() => setDatePickerState({
                      visible: true,
                      seasonIdx: sIdx,
                      field: 'endDate',
                      value: season.endDate ? new Date(season.endDate) : new Date()
                    })}
                  >
                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>
                      {season.endDate ? season.endDate.split('-').reverse().join('/') : 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.daysGrid}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dayName, index) => {
                    const dayKey = index === 6 ? 0 : index + 1;
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
                            const newSchedules = [...formData.structuredSchedules];
                            newSchedules[sIdx].days[dayKey][field] = val;
                            setFormData(prev => ({ ...prev, structuredSchedules: newSchedules }));
                          }
                        })}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '800', color: value === 'Cerrado' ? '#E74C3C' : theme.text }}>
                          {value || '--:--'}
                        </Text>
                      </TouchableOpacity>
                    );

                    return (
                      <View key={dayKey} style={styles.dayRow}>
                        <Text style={{ width: 25, color: theme.text, fontWeight: '800' }}>{dayName}</Text>
                        <TouchableOpacity 
                          style={[styles.toggle, { backgroundColor: dayData.isOpen ? theme.primary : theme.border }]}
                          onPress={() => {
                            const newSchedules = [...formData.structuredSchedules];
                            newSchedules[sIdx].days[dayKey].isOpen = !dayData.isOpen;
                            setFormData(prev => ({ ...prev, structuredSchedules: newSchedules }));
                          }}
                        >
                          <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>{dayData.isOpen ? 'SÍ' : 'NO'}</Text>
                        </TouchableOpacity>
                        
                        {dayData.isOpen && (
                          <View style={styles.timeInputsRow}>
                            <TimeTrigger value={dayData.mOpen} field="mOpen" label="Apertura (M)" />
                            <Text style={{ color: theme.textSecondary }}>-</Text>
                            <TimeTrigger value={dayData.mClose} field="mClose" label="Cierre (M)" />
                            <View style={{ width: 1, height: 12, backgroundColor: theme.border, marginHorizontal: 2 }} />
                            <TimeTrigger value={dayData.aOpen} field="aOpen" label="Apertura (T)" />
                            <Text style={{ color: theme.textSecondary }}>-</Text>
                            <TimeTrigger value={dayData.aClose} field="aClose" label="Cierre (T)" />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={[styles.inputContainer, { marginTop: 15 }]}>
              <AlertTriangle color="#E74C3C" size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Cierres especiales (Ej: Cerrado 25 Dic...)"
                placeholderTextColor={theme.textSecondary}
                value={formData.specialClosures}
                onChangeText={(v) => setFormData(prev => ({ ...prev, specialClosures: v }))}
              />
            </View>

            <View style={styles.noticesSection}>
              <View style={styles.sectionHeader}>
                <Info color="#E74C3C" size={22} />
                <Text style={[styles.sectionTitle, { color: theme.primary, marginLeft: 10 }]}>Avisos Críticos (¡Atención!)</Text>
                <TouchableOpacity onPress={handleAddCriticalNotice} style={styles.addBtn}>
                  <PlusCircle color="#E74C3C" size={24} />
                </TouchableOpacity>
              </View>
              {formData.criticalNotices.map((notice, idx) => (
                <View key={idx} style={[styles.inputContainer, { marginTop: 10 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, flex: 1 }]}
                    placeholder="Escribe un aviso crítico..."
                    placeholderTextColor={theme.textSecondary}
                    value={notice}
                    onChangeText={(text) => updateCriticalNotice(idx, text)}
                  />
                  <TouchableOpacity onPress={() => removeCriticalNotice(idx)} style={{ marginLeft: 10 }}>
                    <X color="#E74C3C" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Tarifas y Entradas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Tarifas y Entradas</Text>
              <TouchableOpacity 
                onPress={() => setFormData(prev => ({
                  ...prev,
                  tariffs: [...prev.tariffs, { id: Date.now().toString(), label: 'Nueva Tarifa', price: '0 €', subtypes: [{ id: `sub-${Date.now()}`, type: 'none', value: '', from: '', to: '' }] }]
                }))}
              >
                <PlusCircle color={theme.primary} size={24} />
              </TouchableOpacity>
            </View>

            <View style={[styles.tariffsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {formData.tariffs.map((tariff, idx) => (
                <View key={tariff.id} style={styles.tariffCard}>
                  <View style={styles.tariffRowMain}>
                    <TouchableOpacity onPress={() => {
                      setFormData(prev => {
                        const newTariffs = [...prev.tariffs];
                        newTariffs.splice(idx, 1);
                        return { ...prev, tariffs: newTariffs };
                      });
                    }}>
                      <MinusCircle color="#E74C3C" size={20} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.tariffSelector, { borderBottomColor: theme.border }]}
                      onPress={() => setPickerModal({
                        visible: true,
                        title: 'Tipo de Tarifa',
                        options: TARIFF_PRESETS,
                        onSelect: (val) => {
                          const newTariffs = [...formData.tariffs];
                          newTariffs[idx].label = val;
                          setFormData(prev => ({ ...prev, tariffs: newTariffs }));
                        }
                      })}
                    >
                      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{tariff.label}</Text>
                      <ChevronLeft color={theme.textSecondary} size={14} style={{ transform: [{ rotate: '-90deg' }] }} />
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.priceInput, { color: theme.primary, backgroundColor: theme.primary + '15' }]}
                      value={tariff.price}
                      placeholder="0 €"
                      onChangeText={(v) => {
                        const newTariffs = [...formData.tariffs];
                        newTariffs[idx].price = v.includes('€') ? v : `${v} €`;
                        setFormData(prev => ({ ...prev, tariffs: newTariffs }));
                      }}
                    />
                  </View>

                  {/* Subtipos / Condiciones / Lugares Incluidos */}
                  {tariff.subtypes && tariff.subtypes.map((subtype, subIdx) => {
                    const isConjunta = tariff.label && tariff.label.includes('Conjunta');
                    return (
                    <View key={subtype.id || subIdx} style={[styles.conditionSection, { marginTop: subIdx > 0 ? 10 : 0 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity 
                          style={[styles.conditionSelector, { flex: 1, backgroundColor: theme.background, borderColor: theme.border }]}
                          onPress={() => setPickerModal({
                            visible: true,
                            title: isConjunta ? 'Lugar Incluido' : 'Subtipo / Condición',
                            options: isConjunta ? placesInCity : TARIFF_SUBTYPES.map(s => s.label),
                            onSelect: (val) => {
                              if (isConjunta) {
                                updateTariffSubtype(idx, subIdx, 'type', 'included_place');
                                updateTariffSubtype(idx, subIdx, 'value', val);
                              } else {
                                const selectedType = TARIFF_SUBTYPES.find(s => s.label === val);
                                updateTariffSubtype(idx, subIdx, 'type', selectedType.id);
                              }
                            }
                          })}
                        >
                          <Info color={theme.primary} size={14} />
                          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600', flex: 1, marginLeft: 5 }}>
                            {isConjunta 
                              ? (subtype.value || 'Seleccionar lugar incluido...') 
                              : TARIFF_SUBTYPES.find(s => s.id === (subtype.type || 'none'))?.label}
                          </Text>
                          <ChevronLeft color={theme.textSecondary} size={12} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                        
                        {tariff.subtypes.length > 1 && (
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
                    );
                  })}
                  
                  <TouchableOpacity onPress={() => addTariffSubtype(idx)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 5 }}>
                    <PlusCircle color={theme.primary} size={14} />
                    <Text style={{ color: theme.primary, fontSize: 11, marginLeft: 4, fontWeight: '600' }}>{tariff.label && tariff.label.includes('Conjunta') ? 'Añadir Lugar Incluido' : 'Añadir Subtipo a esta Tarifa'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.linkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>Entrada vinculada</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>¿Se incluye con la entrada de otro lugar?</Text>
                </View>
                <Switch 
                  value={formData.isLinkedEntrance}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, isLinkedEntrance: v }))}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={formData.isLinkedEntrance ? '#FFF' : '#f4f3f4'}
                />
              </View>
              
              <View style={[styles.inputContainer, { marginTop: 15 }]}>
                <Info color={theme.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Info adicional (Ej: Gratis los domingos)"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.additionalInfo}
                  onChangeText={(v) => setFormData(prev => ({ ...prev, additionalInfo: v }))}
                />
              </View>
            </View>
          </View>

          {/* Servicios Adicionales */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <PlusCircle color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Servicios Adicionales</Text>
            </View>

            <View style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'column', alignItems: 'flex-start', padding: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <Headphones color={theme.primary} size={20} style={styles.serviceIcon} />
                <Text style={[styles.serviceLabel, { color: theme.text, flex: 1 }]}>Audioguía</Text>
                <Switch 
                  value={formData.additionalServices.audioguide.enabled}
                  onValueChange={() => toggleService('audioguide')}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={formData.additionalServices.audioguide.enabled ? '#FFF' : '#f4f3f4'}
                />
              </View>
              
              {formData.additionalServices.audioguide.enabled && (
                <View style={styles.serviceDetailRow}>
                  <View style={styles.servicePriceInput}>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Precio (€)</Text>
                    <TextInput
                      style={[styles.smallInput, { color: theme.primary, backgroundColor: theme.primary + '10' }]}
                      value={formData.additionalServices.audioguide.price}
                      keyboardType="numeric"
                      onChangeText={(v) => updateServiceDetail('audioguide', 'price', v)}
                    />
                  </View>
                  <View style={styles.serviceFreeToggle}>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Gratis PCD</Text>
                    <Switch 
                      value={formData.additionalServices.audioguide.freeForDisabled}
                      onValueChange={(v) => updateServiceDetail('audioguide', 'freeForDisabled', v)}
                      trackColor={{ false: theme.border, true: '#2ECC71' }}
                      scaleX={0.7} scaleY={0.7}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10, flexDirection: 'column', alignItems: 'flex-start', padding: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <Users color={theme.primary} size={20} style={styles.serviceIcon} />
                <Text style={[styles.serviceLabel, { color: theme.text, flex: 1 }]}>Visitas Guiadas</Text>
                <Switch 
                  value={formData.additionalServices.guidedVisits.enabled}
                  onValueChange={() => toggleService('guidedVisits')}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={formData.additionalServices.guidedVisits.enabled ? '#FFF' : '#f4f3f4'}
                />
              </View>

              {formData.additionalServices.guidedVisits.enabled && (
                <View style={styles.serviceDetailRow}>
                  <View style={styles.servicePriceInput}>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Precio (€)</Text>
                    <TextInput
                      style={[styles.smallInput, { color: theme.primary, backgroundColor: theme.primary + '10' }]}
                      value={formData.additionalServices.guidedVisits.price}
                      keyboardType="numeric"
                      onChangeText={(v) => updateServiceDetail('guidedVisits', 'price', v)}
                    />
                  </View>
                  <View style={styles.serviceFreeToggle}>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Gratis PCD</Text>
                    <Switch 
                      value={formData.additionalServices.guidedVisits.freeForDisabled}
                      onValueChange={(v) => updateServiceDetail('guidedVisits', 'freeForDisabled', v)}
                      trackColor={{ false: theme.border, true: '#2ECC71' }}
                      scaleX={0.7} scaleY={0.7}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Especificaciones Técnicas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Construction color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10 }]}>Especificaciones Técnicas</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 15 }}>
              Datos técnicos precisos para usuarios con movilidad reducida o necesidades sensoriales.
            </Text>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smallLabel, { color: theme.textSecondary }]}>Ancho Puerta (cm)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Ej: 120cm"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.technicalSpecs.doorWidth}
                  onChangeText={(v) => updateTechnical('doorWidth', v)}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.smallLabel, { color: theme.textSecondary }]}>Medidas Ascensor</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Ej: 140x110cm"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.technicalSpecs.elevatorMeasures}
                  onChangeText={(v) => updateTechnical('elevatorMeasures', v)}
                />
              </View>
            </View>

            <View style={styles.techTogglesGrid}>
              <TouchableOpacity 
                style={[styles.techToggleBtn, { backgroundColor: formData.technicalSpecs.adaptedToilet ? theme.primary + '30' : theme.surface, borderColor: formData.technicalSpecs.adaptedToilet ? theme.primary : theme.border }]}
                onPress={() => toggleTechnical('adaptedToilet')}
              >
                <CheckCircle2 color={formData.technicalSpecs.adaptedToilet ? theme.primary : theme.textSecondary} size={18} />
                <Text style={[styles.techToggleLabel, { color: theme.text }]}>Baño Adaptado</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.techToggleBtn, { backgroundColor: formData.technicalSpecs.magneticLoop ? theme.primary + '30' : theme.surface, borderColor: formData.technicalSpecs.magneticLoop ? theme.primary : theme.border }]}
                onPress={() => toggleTechnical('magneticLoop')}
              >
                <Ear color={formData.technicalSpecs.magneticLoop ? theme.primary : theme.textSecondary} size={18} />
                <Text style={[styles.techToggleLabel, { color: theme.text }]}>Bucle Magnético</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.techToggleBtn, { backgroundColor: formData.technicalSpecs.braille ? theme.primary + '30' : theme.surface, borderColor: formData.technicalSpecs.braille ? theme.primary : theme.border }]}
                onPress={() => toggleTechnical('braille')}
              >
                <Eye color={formData.technicalSpecs.braille ? theme.primary : theme.textSecondary} size={18} />
                <Text style={[styles.techToggleLabel, { color: theme.text }]}>Braille</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.techToggleBtn, { backgroundColor: formData.technicalSpecs.accessibleParking ? theme.primary + '30' : theme.surface, borderColor: formData.technicalSpecs.accessibleParking ? theme.primary : theme.border }]}
                onPress={() => toggleTechnical('accessibleParking')}
              >
                <MapPin color={formData.technicalSpecs.accessibleParking ? theme.primary : theme.textSecondary} size={18} />
                <Text style={[styles.techToggleLabel, { color: theme.text }]}>Parking</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.techToggleBtn, { backgroundColor: formData.technicalSpecs.wheelchairRental ? theme.primary + '30' : theme.surface, borderColor: formData.technicalSpecs.wheelchairRental ? theme.primary : theme.border }]}
                onPress={() => toggleTechnical('wheelchairRental')}
              >
                <Accessibility color={formData.technicalSpecs.wheelchairRental ? theme.primary : theme.textSecondary} size={18} />
                <Text style={[styles.techToggleLabel, { color: theme.text }]}>Sillas</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.publishBtn, { backgroundColor: theme.primary }]}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Check color="#FFF" size={24} />
                <Text style={styles.publishBtnText}>Publicar Lugar</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

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

      {datePickerState.visible && (
        <DateTimePicker
          value={datePickerState.value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setDatePickerState(prev => ({ ...prev, visible: false }));
            if (selectedDate && datePickerState.seasonIdx !== null && datePickerState.field) {
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const dd = String(selectedDate.getDate()).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;
              
              const newSchedules = [...formData.structuredSchedules];
              const updatedSeason = newSchedules[datePickerState.seasonIdx];
              updatedSeason[datePickerState.field] = dateStr;
              
              // Auto-format human-friendly period
              const startDM = updatedSeason.startDate ? updatedSeason.startDate.split('-').reverse().slice(0,2).join('/') : '';
              const endDM = updatedSeason.endDate ? updatedSeason.endDate.split('-').reverse().slice(0,2).join('/') : '';
              updatedSeason.period = startDM && endDM ? `${startDM} al ${endDM}` : 'Todo el año';
              
              setFormData(prev => ({ ...prev, structuredSchedules: newSchedules }));
            }
          }}
        />
      )}

      <>
        {isAiLoading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: theme.surface, padding: 35, borderRadius: 30, alignItems: 'center', width: '85%', borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.headerTitle, { color: theme.text, marginTop: 25, textAlign: 'center', fontSize: 22 }]}>Análisis de Patrimonio Distravel</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center', fontStyle: 'italic', fontSize: 14, lineHeight: 20 }}>
                Investigando historia, accesibilidad y tarifas de "{formData.name}" en {formData.city}...
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

        {showSuccess && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 20000, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                <Check color="#FFF" size={60} strokeWidth={4} />
              </View>
              <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>¡Lugar Guardado!</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Se ha añadido correctamente a la base de datos.</Text>
            </View>
          </View>
        )}
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  imagePicker: {
    height: 200,
    width: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 25
  },
  pickedImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  inputIcon: { position: 'absolute', left: 15, zIndex: 1, opacity: 0.8 },
  inputEndIcon: { position: 'absolute', right: 15, zIndex: 1, opacity: 0.8 },
  input: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 45,
    fontSize: 15,
    borderWidth: 1,
    fontWeight: '600'
  },
  textArea: {
    flex: 1,
    height: 100,
    borderRadius: 15,
    paddingHorizontal: 45,
    paddingTop: 15,
    fontSize: 15,
    borderWidth: 1,
    textAlignVertical: 'top',
    fontWeight: '600'
  },
  rowInputs: { flexDirection: 'row', alignItems: 'center' },
  categoryContainer: { marginTop: 20 },
  categoryScroll: { paddingRight: 20 },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10
  },
  categoryText: { fontWeight: '800', fontSize: 14 },
  accessibilityGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    gap: 12
  },
  accessCard: {
    width: '48%',
    height: 110,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5
  },
  accessLabel: { marginTop: 10, fontWeight: '800', fontSize: 15 },
  mapContainer: {
    height: 200,
    borderRadius: 25,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 10
  },
  map: { flex: 1 },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10
  },
  mapOverlayText: { color: '#FFF', fontSize: 11, textAlign: 'center', fontWeight: '600' },
  seasonCard: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15
  },
  seasonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  seasonNameInput: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  selector: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center'
  },
  daysGrid: { gap: 8 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggle: { width: 32, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  timeInputsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeSelector: { width: 48, paddingVertical: 4, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
  tariffsContainer: { padding: 15, borderRadius: 20, borderWidth: 1 },
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
  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  servicePriceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  serviceFreeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  smallInput: {
    width: 60,
    height: 35,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800'
  },
  linkRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0,0,0,0.05)' 
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1
  },
  serviceIcon: { marginRight: 15 },
  serviceLabel: { flex: 1, fontWeight: '800', fontSize: 15 },
  smallLabel: { fontSize: 11, fontWeight: '700', marginBottom: 5, marginLeft: 5 },
  techTogglesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
    marginTop: 15
  },
  techToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  techToggleLabel: { marginLeft: 8, fontWeight: '700', fontSize: 13 },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 20,
    marginTop: 40,
    marginBottom: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  publishBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  pickerContent: { width: '85%', maxHeight: '70%', borderRadius: 25, padding: 20 },
  pickerItem: { paddingVertical: 15, borderBottomWidth: 0.5, alignItems: 'center' },
  pickerItemText: { fontSize: 16, fontWeight: '600' },
  searchResults: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 15,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  }
});
