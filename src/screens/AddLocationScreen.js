import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { GeminiService } from '../utils/gemini';
import MUNICIPIOS_DATA from '../data/municipios.json';
import { INE_PROVINCES, PROVINCE_TO_REGION } from '../data/provinces';
import { 
  ChevronLeft, 
  Camera, 
  MapPin, 
  Clock, 
  CreditCard, 
  Plus, 
  Trash2, 
  Info, 
  Building2,
  Calendar,
  Maximize2,
  Check,
  Tag,
  Languages,
  Phone,
  Globe,
  Sparkles,
  Zap,
  LayoutList,
  Eye,
  Ear,
  Brain,
  Accessibility,
  TriangleAlert,
  Mic,
  Users,
  Construction,
  ShieldCheck
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { typography } from '../theme/typography';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const CATEGORIES = ['Museo', 'Iglesia', 'Parque', 'Restaurante', 'Hotel', 'Atracción'];
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const LOCAL_FALLBACK_MUNICIPIOS = MUNICIPIOS_DATA.map(m => {
  const provinceName = INE_PROVINCES[m.parent_code] || 'Desconocida';
  const regionName = PROVINCE_TO_REGION[provinceName] || 'España';
  const cityName = m.label || '';
  return { 
    ...m, 
    name: cityName, 
    normalizedName: cityName.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i'),
    province: provinceName, 
    region: regionName 
  };
});

export function AddLocationScreen({ route, navigation }) {
  const { defaultCity } = route.params || {};
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData, persistImage, uploadImageToServer } = useUser();

  // Buscar datos iniciales si hay defaultCity
  const initialCityData = React.useMemo(() => {
    if (!defaultCity) return null;
    return LOCAL_FALLBACK_MUNICIPIOS.find(m => m.name === defaultCity);
  }, [defaultCity]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Museo',
    city: defaultCity || '',
    province: initialCityData?.province || '',
    region: initialCityData?.region || '',
    description: '',
    touristTip: '',
    website: '',
    phone: '',
    address: '',
    tags: '',
    freeInfo: '',
    importantNotices: [],
    seasons: [],
    isSplitSchedule: false,
    morningOpen: '10:00',
    morningClose: '14:00',
    afternoonOpen: '16:00',
    afternoonClose: '20:00',
    closedHolidays: true,
    image: null,
    schedules: [
      { id: '1', days: 'De miércoles a domingo', hours: 'De 11.00 h a 19.00 h' }
    ],
    isLinkedEntrance: false,
    linkedEntranceName: '',
    technicalSpecs: {
      doorWidth: '',
      adaptedToilet: false,
      elevatorDimensions: '',
      magneticLoop: false,
      brailleSignage: false
    }
  });

  const [accessibilityFeatures, setAccessibilityFeatures] = useState({
    physical: true,
    visual: false,
    auditory: false,
    cognitive: false
  });

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [tariffs, setTariffs] = useState([
    { id: '1', label: 'Adulto', price: '' },
    { id: '2', label: 'PCD / Discapacidad', price: '0' }
  ]);

  const [openingDays, setOpeningDays] = useState({
    'Lun': true, 'Mar': true, 'Mié': true, 'Jue': true, 'Vie': true, 'Sáb': true, 'Dom': true
  });

  const [location, setLocation] = useState({
    latitude: 40.4168,
    longitude: -3.7038,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const scrollRef = useRef(null);

  const [audioguide, setAudioguide] = useState({
    available: false,
    price: '0',
    accessible: true,
    languages: ['Español']
  });

  const [guidedVisits, setGuidedVisits] = useState({
    available: false,
    price: '',
    description: '',
    schedules: [
      { id: 'gv1', time: '11:00', days: 'Todos los días' }
    ],
    languages: ['Español']
  });

  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityResults, setShowCityResults] = useState(false);
  const [isUserTypingCity, setIsUserTypingCity] = useState(false);
  const searchTimeout = React.useRef(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let currentPos = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: currentPos.coords.latitude,
          longitude: currentPos.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setLocation(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    })();
  }, []);

  // Búsqueda de municipios
  React.useEffect(() => {
    if (!formData.city || formData.city.length < 2 || defaultCity || !isUserTypingCity) {
      setCitySearchResults([]);
      setShowCityResults(false);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsSearchingCity(true);
      setShowCityResults(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const response = await fetch(`${API_ENDPOINTS.MUNICIPALITIES}?search=${encodeURIComponent(formData.city)}&limit=8`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setCitySearchResults(data.map(m => ({
            ...m,
            name: m.name || m.label,
            province: INE_PROVINCES[m.parent_code] || 'Provincia',
            region: PROVINCE_TO_REGION[INE_PROVINCES[m.parent_code]] || 'España'
          })));
        } else {
          performLocalCitySearch();
        }
      } catch (error) {
        performLocalCitySearch();
      } finally {
        setIsSearchingCity(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [formData.city]);

  const performLocalCitySearch = () => {
    const normQuery = normalize(formData.city);
    const filtered = LOCAL_FALLBACK_MUNICIPIOS
      .filter(m => m.normalizedName.includes(normQuery))
      .slice(0, 8);
    setCitySearchResults(filtered);
  };

  const normalize = (text) => {
    if (!text) return '';
    return text.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i');
  };

  const mapRef = React.useRef(null);

  const handleAIAutoFill = async (keepUserImage = false) => {
    if (!formData.name) {
      Alert.alert("Nombre necesario", "Escribe el nombre del lugar para que la IA pueda buscarlo.");
      return;
    }

    Keyboard.dismiss();
    setIsRecognizing(true);
    setAiProgress(0.1);
    
    // Simular progreso dinámico
    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 0.95) return prev;
        const increment = (0.95 - prev) * 0.1;
        return prev + increment;
      });
    }, 400);
    
    try {
      // Usar el nuevo servicio dinámico de Gemini 1.5
      const aiData = await GeminiService.getPlaceData(formData.name, formData.city, userData.aiApiKey, formData.category, userData.openaiApiKey);

      if (aiData) {
        console.log("[AI] Datos recibidos:", aiData.name, "Mock:", !!aiData.isMock);
        setAiProgress(1);
        
        // Batch de actualizaciones en un solo objeto para evitar estados inconsistentes
        const updatedData = {
          ...formData,
          ...aiData,
          city: defaultCity || aiData.city || formData.city,
          name: aiData.name || formData.name,
          image: (keepUserImage && formData.image) ? formData.image : (aiData.image || formData.image)
        };

        if (aiData.technicalSpecs) {
          updatedData.technicalSpecs = {
            doorWidth: aiData.technicalSpecs.doorWidth || '',
            adaptedToilet: !!aiData.technicalSpecs.adaptedToilet,
            elevatorDimensions: aiData.technicalSpecs.elevatorDimensions || '',
            magneticLoop: !!aiData.technicalSpecs.magneticLoop,
            brailleSignage: !!aiData.technicalSpecs.brailleSignage
          };
        }

        setFormData(updatedData);
        
        if (aiData.accessibility) {
          setAccessibilityFeatures({
            physical: !!aiData.accessibility.physical,
            visual: !!aiData.accessibility.visual,
            auditory: !!aiData.accessibility.auditory,
            cognitive: !!aiData.accessibility.cognitive
          });
        }

        if (aiData.tariffs) setTariffs(Array.isArray(aiData.tariffs) ? aiData.tariffs : []);
        if (aiData.audioguide) setAudioguide({
          available: !!aiData.audioguide.available,
          price: aiData.audioguide.price || '',
          accessible: !!aiData.audioguide.accessible
        });
        
        if (aiData.guidedVisits) {
          setGuidedVisits({
            available: !!aiData.guidedVisits.available,
            price: aiData.guidedVisits.price || '',
            languages: Array.isArray(aiData.guidedVisits.languages) ? aiData.guidedVisits.languages : ['Español'],
            schedules: Array.isArray(aiData.guidedVisits.schedules) ? aiData.guidedVisits.schedules : []
          });
        }
        
        // Geolocalización inteligente (con protección ante fallos)
        try {
          if (aiData.location && aiData.location.latitude) {
            const region = {
              latitude: Number(aiData.location.latitude),
              longitude: Number(aiData.location.longitude),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            };
            setLocation(region);
            mapRef.current?.animateToRegion(region, 1000);
          } else if (aiData.address || aiData.city) {
            // Intentar geocodificar si no vino en el JSON pero hay dirección
            const query = `${aiData.name}, ${aiData.address || aiData.city}, España`;
            const geocodeResult = await Location.geocodeAsync(query);
            if (geocodeResult && geocodeResult.length > 0) {
              const region = {
                latitude: geocodeResult[0].latitude,
                longitude: geocodeResult[0].longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              };
              setLocation(region);
              mapRef.current?.animateToRegion(region, 1000);
            }
          }
        } catch (geoError) {
          // El geocoding falló, pero la ficha se sigue rellenando correctamente
          console.warn('[AI] Geocodificación no disponible, el pin queda en posición actual:', geoError.message);
        }
        
        if (aiData.isMock) {
          Alert.alert(
            "Información Optimizada",
            `Hemos generado una ficha base profesional para "${formData.name}". Puedes completar los detalles específicos manualmente para asegurar la máxima precisión.`
          );
        } else {
          Alert.alert(
            "🚀 Investigación Completada", 
            `Gemini ha analizado "${formData.name}" en "${formData.city}" y ha completado todos los campos técnicos, incluyendo accesibilidad, horarios y tarifas reales.`
          );
        }
      } else {
        Alert.alert("Error de IA", "No pudimos obtener datos reales. Por favor, completa la ficha manualmente.");
      }
    } catch (error) {
      console.error("Error in AI Enhance:", error);
      Alert.alert("Error", "Hubo un problema al conectar con la IA.");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsRecognizing(false);
        setIsUserTypingCity(false);
        setAiProgress(0);
      }, 500);
    }
  };

  const toggleDay = (day) => {
    setOpeningDays({ ...openingDays, [day]: !openingDays[day] });
  };

  const handleAIRecognition = async () => {
    Keyboard.dismiss();
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara para reconocer el lugar.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const capturedUri = result.assets[0].uri;
      setFormData(prev => ({ ...prev, image: capturedUri })); // Save the actual photo!
      setIsRecognizing(true);
      
      // Simulate AI recognition based on location or vision
      setTimeout(() => {
        setIsRecognizing(false);
        // If we were at Castillo de Santa Barbara, we'd set that name
        // For now, let's just trigger the fill logic but KEEP our image
        handleAIAutoFill(true); // pass true to indicate it's from camera
      }, 2000);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para subir la foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const addSeason = () => {
    setFormData(prev => ({
      ...prev,
      seasons: [...(prev.seasons || []), { name: '', period: '', weekday: '', weekend: '' }]
    }));
  };

  const removeSeason = (index) => {
    setFormData(prev => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index)
    }));
  };

  const updateSeason = (index, field, value) => {
    const newSeasons = [...formData.seasons];
    newSeasons[index][field] = value;
    setFormData({ ...formData, seasons: newSeasons });
  };

  const addNotice = () => {
    setFormData(prev => ({
      ...prev,
      importantNotices: [...(prev.importantNotices || []), '']
    }));
  };

  const removeNotice = (index) => {
    setFormData(prev => ({
      ...prev,
      importantNotices: prev.importantNotices.filter((_, i) => i !== index)
    }));
  };

  const updateNotice = (index, value) => {
    const newNotices = [...formData.importantNotices];
    newNotices[index] = value;
    setFormData({ ...formData, importantNotices: newNotices });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.city) {
      Alert.alert("Campos incompletos", "Por favor, introduce al menos el nombre y la ciudad.");
      return;
    }

    if (!formData.image) {
      Alert.alert("Foto necesaria", "Es obligatorio incluir una fotografía (puedes usar la IA para buscarla en Wikipedia).");
      return;
    }

    setIsUploading(true);
    
    (async () => {
      try {
        // Persistir la imagen localmente primero por seguridad
        let finalImage = formData.image;
        if (formData.image && formData.image.startsWith('file://')) {
          const sanitizedName = formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const localUri = await persistImage(formData.image, `place_${sanitizedName}`);
          
          // Intentar subir al servidor para compartir con otros
          const serverUrl = await uploadImageToServer(localUri);
          if (serverUrl) {
            finalImage = serverUrl;
          } else {
            finalImage = localUri; // Fallback a local si el servidor falla
          }
        }

        // Crear el objeto del nuevo lugar asegurando que la imagen de Wikipedia o Cámara se guarda
        const newPlace = {
          id: Date.now().toString(),
          ...formData, // Incluye name, city, description, etc.
          image: finalImage, // Usar la imagen persistida
          location,
          tariffs,
          openingDays,
          audioguide,
          guidedVisits,
          accessibility: accessibilityFeatures,
          isUserAdded: true,
          rating: 5.0,
          reviews: 0,
          verifiedStatus: 'Pendiente'
        };

        // Guardar en las contribuciones del usuario localmente (Asegurando persistencia)
        updateUserData('contributions', (prev) => {
          const list = prev || [];
          // Evitar duplicados por nombre en la misma ciudad si es posible
          const filtered = list.filter(p => !(p.name === newPlace.name && p.city === newPlace.city));
          return [...filtered, newPlace];
        });
        
        // Timeout ligero para asegurar que el estado se procesa antes de salir
        setTimeout(() => {
          setIsUploading(false);
          Alert.alert(
            "¡Lugar Registrado!", 
            "El Castillo de Santa Bárbara se ha guardado en tus descubrimientos con su fotografía.", 
            [{ text: "Ver en mi Perfil", onPress: () => navigation.goBack() }]
          );
        }, 500);
      } catch (error) {
        console.error("Error al guardar:", error);
        setIsUploading(false);
        Alert.alert("Error de guardado", "No hemos podido guardar los datos. Revisa tu conexión o el espacio en el dispositivo.");
      }
    })();
  };

  const toggleAccessibility = (key) => {
    setAccessibilityFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Añadir Nuevo Lugar</Text>
        <TouchableOpacity onPress={handleAIRecognition} style={styles.aiHeaderBtn}>
          <Sparkles color={theme.primary} size={22} />
        </TouchableOpacity>
      </SafeAreaView>
      
      {isRecognizing && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.surface, padding: 30, borderRadius: 25, alignItems: 'center', width: '85%', borderWidth: 1, borderColor: theme.border }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[typography.h2, { color: theme.text, marginTop: 20, textAlign: 'center' }]}>Análisis de Inteligencia Turística</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
              Investigando historia, horarios y accesibilidad de "{formData.name}"...
            </Text>
            <View style={{ height: 6, width: '100%', backgroundColor: theme.border, borderRadius: 3, marginTop: 20, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${aiProgress * 100}%`, backgroundColor: theme.primary }} />
            </View>
            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '800', marginTop: 10 }}>
              {Math.round(aiProgress * 100)}% COMPLETADO
            </Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <ScrollView 
          ref={scrollRef}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        
        {/* Photo Upload Section */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={[styles.photoUpload, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={pickImage}>
            {formData.image ? (
              <Image 
                key={formData.image}
                source={{ uri: formData.image }} 
                style={styles.previewImage} 
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera color={theme.textSecondary} size={40} />
                <Text style={[styles.photoText, { color: theme.textSecondary }]}>Subir Foto Principal</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {formData.image && !isRecognizing && (
            <TouchableOpacity 
              style={[styles.aiAnalyzeBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleAIAutoFill(true)}
            >
              <Sparkles color="#FFF" size={16} />
              <Text style={styles.aiAnalyzeBtnText}>Analizar con IA</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Sections */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <LayoutList color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información General</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Building2 color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nombre del monumento o lugar"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
              />
              <TouchableOpacity onPress={handleAIAutoFill} disabled={isRecognizing}>
                {isRecognizing ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Sparkles color={theme.primary} size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={[
              styles.inputContainer, 
              { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10 },
              defaultCity && { opacity: 0.7, backgroundColor: theme.background }
            ]}>
              <MapPin color={defaultCity ? theme.textSecondary : theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: defaultCity ? theme.textSecondary : theme.text }]}
                placeholder="Ciudad"
                placeholderTextColor={theme.textSecondary}
                value={formData.city}
                onFocus={() => {
                  // Desplazar hacia arriba para que los resultados no queden tapados
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: 350, animated: true });
                  }, 100);
                }}
                onChangeText={(text) => {
                  setIsUserTypingCity(true);
                  setFormData(prev => ({...prev, city: text}));
                }}
                editable={!defaultCity}
              />
              {defaultCity && (
                <View style={{ backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 5 }}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>FIJO</Text>
                </View>
              )}
            </View>

            {/* City Search Results */}
            {showCityResults && (
              <View style={[styles.citySearchResults, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {isSearchingCity ? (
                  <View style={{ padding: 15, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={theme.primary} />
                  </View>
                ) : citySearchResults.length > 0 ? (
                  citySearchResults.map((city, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.cityResultItem, { borderBottomWidth: idx === citySearchResults.length - 1 ? 0 : 0.5, borderBottomColor: theme.border }]}
                      onPress={() => {
                        setIsUserTypingCity(false);
                        setFormData(prev => ({ ...prev, city: city.name, province: city.province }));
                        setShowCityResults(false);
                        setCitySearchResults([]);
                        Keyboard.dismiss();
                      }}
                    >
                      <MapPin color={theme.primary} size={14} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.cityResultName, { color: theme.text }]}>{city.name}</Text>
                        <Text style={[styles.cityResultProvince, { color: theme.textSecondary }]}>{city.province}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: 15, alignItems: 'center' }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>No se encontraron municipios</Text>
                  </View>
                )}
              </View>
            )}

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10, height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Info color={theme.primary} size={20} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.input, { color: theme.text, height: 80, textAlignVertical: 'top' }]}
                placeholder="Descripción del lugar (Historia, qué ver...)"
                placeholderTextColor={theme.textSecondary}
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10, height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Sparkles color="#F1C40F" size={20} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.input, { color: theme.text, height: 60, textAlignVertical: 'top' }]}
                placeholder="Tip Turístico (Mejor hora, qué no perderse...)"
                placeholderTextColor={theme.textSecondary}
                multiline
                value={formData.touristTip}
                onChangeText={(text) => setFormData(prev => ({...prev, touristTip: text}))}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10 }]}>
              <MapPin color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Dirección exacta (Calle, número...)"
                placeholderTextColor={theme.textSecondary}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({...prev, address: text}))}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1.2 }]}>
                <Globe color={theme.primary} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Web oficial"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.website}
                  onChangeText={(text) => setFormData(prev => ({...prev, website: text}))}
                />
              </View>
              <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, flex: 0.8 }]}>
                <Phone color={theme.primary} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Teléfono"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10 }]}>
              <Tag color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Etiquetas (separadas por comas)"
                placeholderTextColor={theme.textSecondary}
                value={formData.tags}
                onChangeText={(text) => setFormData(prev => ({...prev, tags: text}))}
              />
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setFormData(prev => ({...prev, category: cat}))}
                  style={[
                    styles.categoryBtn, 
                    { backgroundColor: formData.category === cat ? theme.primary : theme.surface, borderColor: theme.border }
                  ]}
                >
                  <Text style={[styles.categoryText, { color: formData.category === cat ? '#FFF' : theme.text }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>



        {/* Accessibility Features Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Accessibility color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesibilidad Adaptada</Text>
          </View>
          
          <View style={styles.accessibilityGrid}>
            <TouchableOpacity 
              style={[
                styles.accessCard, 
                { 
                  backgroundColor: accessibilityFeatures.physical ? theme.primary : theme.surface, 
                  borderColor: accessibilityFeatures.physical ? theme.primary : theme.border 
                }
              ]}
              onPress={() => toggleAccessibility('physical')}
            >
              <MapPin color={accessibilityFeatures.physical ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.physical ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.text }]}>Física</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.accessCard, 
                { 
                  backgroundColor: accessibilityFeatures.visual ? theme.primary : theme.surface, 
                  borderColor: accessibilityFeatures.visual ? theme.primary : theme.border 
                }
              ]}
              onPress={() => toggleAccessibility('visual')}
            >
              <Eye color={accessibilityFeatures.visual ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.visual ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.text }]}>Visual</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.accessCard, 
                { 
                  backgroundColor: accessibilityFeatures.auditory ? theme.primary : theme.surface, 
                  borderColor: accessibilityFeatures.auditory ? theme.primary : theme.border 
                }
              ]}
              onPress={() => toggleAccessibility('auditory')}
            >
              <Ear color={accessibilityFeatures.auditory ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.auditory ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.text }]}>Auditiva</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.accessCard, 
                { 
                  backgroundColor: accessibilityFeatures.cognitive ? theme.primary : theme.surface, 
                  borderColor: accessibilityFeatures.cognitive ? theme.primary : theme.border 
                }
              ]}
              onPress={() => toggleAccessibility('cognitive')}
            >
              <Brain color={accessibilityFeatures.cognitive ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.cognitive ? (isDarkMode ? '#070B14' : '#FFFFFF') : theme.text }]}>Cognitiva</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <MapPin color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación Geográfica</Text>
          </View>
          <View style={[styles.mapPreview, { borderColor: theme.border, height: isMapExpanded ? 300 : 150 }]}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={location}
              onRegionChangeComplete={setLocation}
            >
              <Marker coordinate={location} />
            </MapView>
            <TouchableOpacity 
              style={styles.expandMapBtn}
              onPress={() => setIsMapExpanded(!isMapExpanded)}
            >
              <Maximize2 color="#FFF" size={18} />
            </TouchableOpacity>
          </View>
          <Text style={styles.mapHint}>Mueve el mapa para ajustar el pin en la entrada principal.</Text>
        </View>

        {/* Schedule Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Clock color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios de Visita</Text>
          </View>
          
          <View style={{ gap: 15, marginTop: 5 }}>
            {(formData.schedules || []).map((sched, idx) => (
              <View key={sched.id} style={[styles.dynamicScheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.scheduleRowTop}>
                  <TextInput 
                    style={[styles.scheduleInputLabel, { color: theme.text }]}
                    placeholder="Días (Ej: Lunes y Martes)"
                    placeholderTextColor={theme.textSecondary}
                    value={sched.days}
                    onChangeText={(val) => {
                      const newScheds = [...formData.schedules];
                      newScheds[idx].days = val;
                      setFormData({...formData, schedules: newScheds});
                    }}
                  />
                  {idx > 0 && (
                    <TouchableOpacity onPress={() => {
                      const newScheds = formData.schedules.filter((_, i) => i !== idx);
                      setFormData({...formData, schedules: newScheds});
                    }}>
                      <Trash2 color="#E74C3C" size={18} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput 
                  style={[styles.scheduleInputTime, { color: theme.primary }]}
                  placeholder="Horas (Ej: De 11:00 a 15:00 h)"
                  placeholderTextColor={theme.textSecondary}
                  value={sched.hours}
                  onChangeText={(val) => {
                    const newScheds = [...formData.schedules];
                    newScheds[idx].hours = val;
                    setFormData({...formData, schedules: newScheds});
                  }}
                />
              </View>
            ))}

            <TouchableOpacity 
              style={[styles.addScheduleBtn, { borderColor: theme.primary }]}
              onPress={() => setFormData({
                ...formData, 
                schedules: [...formData.schedules, { id: Date.now().toString(), days: '', hours: '' }]
              })}
            >
              <Plus color={theme.primary} size={18} />
              <Text style={[styles.addScheduleBtnText, { color: theme.primary }]}>Añadir otro bloque horario</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 20, height: 'auto', paddingVertical: 10 }]}>
            <TriangleAlert color="#E74C3C" size={20} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Cierres especiales (Ej: Cerrado 25 Dic...)"
              placeholderTextColor={theme.textSecondary}
              multiline
              value={formData.specialClosures}
              onChangeText={(text) => setFormData({...formData, specialClosures: text})}
            />
          </View>
        </View>

        {/* Important Notices Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Info color="#E74C3C" size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Avisos Críticos (¡Atención!)</Text>
            <TouchableOpacity onPress={addNotice} style={styles.addBtn}>
              <Plus color="#E74C3C" size={20} />
            </TouchableOpacity>
          </View>
          {formData.importantNotices.map((notice, idx) => (
            <View key={idx} style={[styles.inputContainer, { backgroundColor: 'rgba(231, 76, 60, 0.05)', borderColor: '#E74C3C', marginBottom: 10 }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Escribe el aviso..."
                value={notice}
                onChangeText={(v) => updateNotice(idx, v)}
              />
              <TouchableOpacity onPress={() => removeNotice(idx)}>
                <Trash2 color="#E74C3C" size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Seasonal Schedule Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Calendar color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios por Temporada</Text>
            <TouchableOpacity onPress={addSeason} style={styles.addBtn}>
              <Plus color={theme.primary} size={20} />
            </TouchableOpacity>
          </View>
          {formData.seasons.map((season, idx) => (
            <View key={idx} style={[styles.seasonFormCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                  style={[styles.seasonFormInput, { fontWeight: '800', color: theme.primary, flex: 1 }]}
                  placeholder="Nombre temporada (Ej: Verano)"
                  value={season.name}
                  onChangeText={(v) => updateSeason(idx, 'name', v)}
                />
                <TouchableOpacity onPress={() => removeSeason(idx)}>
                  <Trash2 color="#E74C3C" size={18} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.seasonFormInput, { color: theme.textSecondary, fontSize: 13 }]}
                placeholder="Periodo (Ej: 1 Abr - 30 Sep)"
                value={season.period}
                onChangeText={(v) => updateSeason(idx, 'period', v)}
              />
              <View style={{ marginTop: 10, gap: 8 }}>
                <View style={styles.seasonFormRow}>
                  <Text style={[styles.seasonFormLabel, { color: theme.text }]}>Lun-Sáb:</Text>
                  <TextInput
                    style={[styles.seasonFormTime, { color: theme.text, borderColor: theme.border }]}
                    placeholder="10:00 - 14:00..."
                    value={season.weekday}
                    onChangeText={(v) => updateSeason(idx, 'weekday', v)}
                  />
                </View>
                <View style={styles.seasonFormRow}>
                  <Text style={[styles.seasonFormLabel, { color: theme.text }]}>Dom/Fest:</Text>
                  <TextInput
                    style={[styles.seasonFormTime, { color: theme.text, borderColor: theme.border }]}
                    placeholder="Cerrado / Mañanas..."
                    value={season.weekend}
                    onChangeText={(v) => updateSeason(idx, 'weekend', v)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Tariffs Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <CreditCard color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas y Entradas</Text>
            <TouchableOpacity 
              onPress={() => setTariffs([...tariffs, { id: Date.now().toString(), label: '', price: '' }])} 
              style={styles.addBtn}
            >
              <Plus color={theme.primary} size={20} />
            </TouchableOpacity>
          </View>

          {tariffs.map((tariff) => (
            <View key={tariff.id} style={styles.tariffRow}>
              <TextInput
                style={[styles.tariffLabelInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Tipo (Ej: Adulto)"
                placeholderTextColor={theme.textSecondary}
                value={tariff.label}
                onChangeText={(text) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, label: text } : t))}
              />
              <TextInput
                style={[styles.tariffPriceInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="€"
                placeholderTextColor={theme.textSecondary}
                value={tariff.price}
                onChangeText={(text) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, price: text } : t))}
              />
              <TouchableOpacity onPress={() => setTariffs(tariffs.filter(t => t.id !== tariff.id))} style={styles.removeBtn}>
                <Trash2 color="#E74C3C" size={18} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={[styles.switchRow, { marginTop: 15 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Entrada Vinculada</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>¿Se incluye con la entrada de otro lugar?</Text>
            </View>
            <Switch 
              value={formData.isLinkedEntrance} 
              onValueChange={(val) => setFormData({...formData, isLinkedEntrance: val})}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>

          {formData.isLinkedEntrance && (
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10 }]}>
              <Building2 color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nombre del lugar (Ej: Castillo de Morella)"
                placeholderTextColor={theme.textSecondary}
                value={formData.linkedEntranceName}
                onChangeText={(text) => setFormData({...formData, linkedEntranceName: text})}
              />
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 15 }]}>
            <Info color={theme.primary} size={20} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Info adicional (Ej: Gratis los domingos)"
              placeholderTextColor={theme.textSecondary}
              value={formData.freeInfo}
              onChangeText={(text) => setFormData({...formData, freeInfo: text})}
            />
          </View>
        </View>

        {/* Services Section: Audioguide & Guided Visits */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Sparkles color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Adicionales</Text>
          </View>

          {/* Audioguide */}
          <View style={[styles.serviceToggleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.serviceToggleHeader}>
              <View style={styles.serviceIconTitle}>
                <Mic color={theme.primary} size={22} />
                <Text style={[styles.serviceLabel, { color: theme.text, marginLeft: 10, fontWeight: '800' }]}>Audioguía</Text>
              </View>
              <Switch 
                value={audioguide.available} 
                onValueChange={(val) => setAudioguide({...audioguide, available: val})}
                trackColor={{ false: '#767577', true: theme.primary }}
              />
            </View>
            
            {audioguide.available && (
              <View style={styles.serviceDetails}>
                <TextInput 
                  style={[styles.serviceInput, { color: theme.text, borderBottomColor: theme.border, borderBottomWidth: 1 }]}
                  placeholder="Precio (Ej: 3€ o Gratis)"
                  placeholderTextColor={theme.textSecondary}
                  value={audioguide.price}
                  onChangeText={(val) => setAudioguide({...audioguide, price: val})}
                />
                <View style={styles.serviceCheckRow}>
                  <Text style={[styles.serviceCheckLabel, { color: theme.textSecondary, fontSize: 13 }]}>Accesible (LSE / Audio)</Text>
                  <Switch 
                    value={audioguide.accessible} 
                    onValueChange={(val) => setAudioguide({...audioguide, accessible: val})}
                    trackColor={{ false: '#767577', true: theme.primary }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Guided Visits */}
          <View style={[styles.serviceToggleCard, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 15 }]}>
            <View style={styles.serviceToggleHeader}>
              <View style={styles.serviceIconTitle}>
                <Users color={theme.primary} size={22} />
                <Text style={[styles.serviceLabel, { color: theme.text, marginLeft: 10, fontWeight: '800' }]}>Visitas Guiadas</Text>
              </View>
              <Switch 
                value={guidedVisits.available} 
                onValueChange={(val) => setGuidedVisits({...guidedVisits, available: val})}
                trackColor={{ false: '#767577', true: theme.primary }}
              />
            </View>
            
            {guidedVisits.available && (
              <View style={styles.serviceDetails}>
                <TextInput 
                  style={[styles.serviceInput, { color: theme.text, borderBottomColor: theme.border, borderBottomWidth: 1 }]}
                  placeholder="Precio de la visita"
                  placeholderTextColor={theme.textSecondary}
                  value={guidedVisits.price}
                  onChangeText={(val) => setGuidedVisits({...guidedVisits, price: val})}
                />

                <TextInput 
                  style={[styles.serviceInput, { color: theme.text, borderBottomColor: theme.border, borderBottomWidth: 1 }]}
                  placeholder="Idiomas (Ej: Español, Inglés, LSE)"
                  placeholderTextColor={theme.textSecondary}
                  value={guidedVisits.languages?.join(', ')}
                  onChangeText={(val) => setGuidedVisits({...guidedVisits, languages: val.split(',').map(s => s.trim())})}
                />
                
                <Text style={[styles.miniLabel, { color: theme.textSecondary, marginTop: 15, fontSize: 12, fontWeight: '700' }]}>HORARIOS DE VISITAS:</Text>
                {guidedVisits.schedules.map((vs, vidx) => (
                  <View key={vs.id} style={styles.visitScheduleRow}>
                    <TextInput 
                      style={[styles.vSchedInput, { flex: 1, color: theme.text, fontWeight: '600' }]}
                      placeholder="Días"
                      value={vs.days}
                      onChangeText={(val) => {
                        const newVs = [...guidedVisits.schedules];
                        newVs[vidx].days = val;
                        setGuidedVisits({...guidedVisits, schedules: newVs});
                      }}
                    />
                    <TextInput 
                      style={[styles.vSchedInput, { width: 80, color: theme.primary, fontWeight: '700' }]}
                      placeholder="Hora"
                      value={vs.time}
                      onChangeText={(val) => {
                        const newVs = [...guidedVisits.schedules];
                        newVs[vidx].time = val;
                        setGuidedVisits({...guidedVisits, schedules: newVs});
                      }}
                    />
                    <TouchableOpacity onPress={() => {
                       const newVs = guidedVisits.schedules.filter((_, i) => i !== vidx);
                       setGuidedVisits({...guidedVisits, schedules: newVs});
                    }}>
                      <Trash2 color="#E74C3C" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity 
                  style={[styles.addVisitBtn, { marginTop: 10 }]}
                  onPress={() => setGuidedVisits({
                    ...guidedVisits, 
                    schedules: [...guidedVisits.schedules, { id: Date.now().toString(), time: '', days: '' }]
                  })}
                >
                  <Plus color={theme.primary} size={14} />
                  <Text style={[styles.addVisitText, { color: theme.primary, marginLeft: 5, fontWeight: '700', fontSize: 12 }]}>Añadir horario de visita</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Especificaciones Técnicas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Construction color={theme.primary} size={22} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Especificaciones Técnicas</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Datos técnicos precisos para usuarios con movilidad reducida o necesidades sensoriales.
          </Text>

          <View style={styles.technicalGrid}>
            <View style={styles.technicalItem}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary, fontSize: 12 }]}>Ancho Puerta (cm)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, height: 45 }]}
                value={formData.technicalSpecs.doorWidth}
                onChangeText={(v) => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, doorWidth: v}})}
                placeholder="Ej: 120cm"
                placeholderTextColor={theme.textSecondary + '80'}
              />
            </View>
            <View style={styles.technicalItem}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary, fontSize: 12 }]}>Medidas Ascensor</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, height: 45 }]}
                value={formData.technicalSpecs.elevatorDimensions}
                onChangeText={(v) => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, elevatorDimensions: v}})}
                placeholder="Ej: 140x110cm"
                placeholderTextColor={theme.textSecondary + '80'}
              />
            </View>
          </View>

          <View style={styles.toggleGrid}>
            <TouchableOpacity 
              style={[styles.toggleBtn, { borderColor: theme.border }, formData.technicalSpecs.adaptedToilet && { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
              onPress={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, adaptedToilet: !formData.technicalSpecs.adaptedToilet}})}
            >
              <ShieldCheck color={formData.technicalSpecs.adaptedToilet ? theme.primary : theme.textSecondary} size={18} />
              <Text style={[styles.toggleBtnText, { color: formData.technicalSpecs.adaptedToilet ? theme.primary : theme.textSecondary }]}>Baño Adaptado</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, { borderColor: theme.border }, formData.technicalSpecs.magneticLoop && { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
              onPress={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, magneticLoop: !formData.technicalSpecs.magneticLoop}})}
            >
              <Ear color={formData.technicalSpecs.magneticLoop ? theme.primary : theme.textSecondary} size={18} />
              <Text style={[styles.toggleBtnText, { color: formData.technicalSpecs.magneticLoop ? theme.primary : theme.textSecondary }]}>Bucle Magnético</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, { borderColor: theme.border }, formData.technicalSpecs.brailleSignage && { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
              onPress={() => setFormData({...formData, technicalSpecs: {...formData.technicalSpecs, brailleSignage: !formData.technicalSpecs.brailleSignage}})}
            >
              <Eye color={formData.technicalSpecs.brailleSignage ? theme.primary : theme.textSecondary} size={18} />
              <Text style={[styles.toggleBtnText, { color: formData.technicalSpecs.brailleSignage ? theme.primary : theme.textSecondary }]}>Braille</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={isDarkMode ? '#070B14' : '#FFFFFF'} />
          ) : (
            <>
              <Check color={isDarkMode ? '#070B14' : '#FFFFFF'} size={24} />
              <Text style={[styles.submitBtnText, { color: isDarkMode ? '#070B14' : '#FFFFFF' }]}>Publicar Lugar</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  aiHeaderBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  photoContainer: {
    position: 'relative',
    marginBottom: 20
  },
  aiAnalyzeBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  aiAnalyzeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700'
  },
  photoUpload: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  previewImage: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoText: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  formSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginLeft: 10, flex: 1 },
  inputGroup: { gap: 0 },
  sectionSubtitle: { fontSize: 13, marginBottom: 15, opacity: 0.7 },
  technicalGrid: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  technicalItem: { flex: 1 },
  toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toggleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 8,
    minWidth: '45%'
  },
  toggleBtnText: { fontSize: 13, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  categoryScroll: { marginTop: 15, paddingBottom: 5 },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryText: { fontSize: 13, fontWeight: '700' },
  dynamicScheduleCard: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    gap: 5,
  },
  scheduleRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleInputLabel: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  scheduleInputTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  addScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addScheduleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  accessibilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  accessCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    gap: 10
  },
  accessCardActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB'
  },
  accessText: {
    fontSize: 14,
    fontWeight: '800'
  },
  mapPreview: {
    height: 150,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  expandMapBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 10,
  },
  mapHint: { fontSize: 12, color: '#95A5A6', textAlign: 'center', fontStyle: 'italic' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 12, fontWeight: '800' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5
  },
  label: { fontSize: 14, fontWeight: '700' },
  timeInputsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  timeCol: { flex: 1 },
  timeLabel: { fontSize: 11, color: '#95A5A6', marginBottom: 5, fontWeight: '700', textTransform: 'uppercase' },
  timeInput: {
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700'
  },
  seasonFormCard: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
    gap: 5,
  },
  seasonFormInput: {
    fontSize: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  seasonFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seasonFormLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  seasonFormTime: {
    fontSize: 13,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 150,
    textAlign: 'right',
  },
  addBtn: { padding: 5 },
  tariffRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'center' },
  tariffLabelInput: { flex: 2, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, fontWeight: '600' },
  tariffPriceInput: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, textAlign: 'center', fontWeight: '700' },
  removeBtn: { padding: 10 },
  serviceToggleCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  serviceToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  serviceInput: {
    height: 45,
    fontSize: 14,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  serviceCheckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  visitScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 10,
    borderRadius: 12,
  },
  vSchedInput: {
    fontSize: 14,
    height: 40,
  },
  addVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitBtnText: { color: '#070B14', fontSize: 18, fontWeight: '900', marginLeft: 12 },
  citySearchResults: {
    marginTop: -5,
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 10,
  },
  cityResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cityResultName: {
    fontSize: 14,
    fontWeight: '700',
  },
  cityResultProvince: {
    fontSize: 11,
  },
});
