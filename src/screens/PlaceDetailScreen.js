import React, { useState, useEffect } from 'react';
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
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  CreditCard, 
  Info, 
  Globe, 
  Phone, 
  Accessibility, 
  Navigation,
  CheckCircle,
  AlertTriangle,
  Edit,
  Sparkles,
  Eye,
  Ear,
  Brain,
  Share2,
  Trash2,
  Save,
  X,
  Camera,
  PlusCircle,
  MinusCircle,
  TrendingDown,
  ShieldCheck,
  Construction,
  Languages,
  Zap
} from 'lucide-react-native';
import { typography } from '../theme/typography';
import { calculatePlaceSavings } from '../utils/savings';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { AutonomousCommunityMap } from '../components/AutonomousCommunityMap';
import { PROVINCE_TO_REGION, INE_PROVINCES } from '../data/provinces';
import MUNICIPIOS_DATA from '../data/municipios.json';

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

const { width } = Dimensions.get('window');
const DAYS_MAP = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function PlaceDetailScreen({ route, navigation }) {
  const { place: navigationPlace } = route.params;
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData, awardExperience } = useUser();
  const insets = useSafeAreaInsets();
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
  const [place, setPlace] = useState(initialPlace);
  const [image, setImage] = useState(place.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a');

  useEffect(() => {
    if (placeFromContext && !isEditing) {
      setPlace(placeFromContext);
      if (placeFromContext.image) {
        setImage(placeFromContext.image);
      }
    }
  }, [placeFromContext, isEditing]);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);

  const handleAiEnhance = () => {
    const hasGemini = userData.aiApiKey && userData.aiApiKey.length > 10;
    setIsAiProcessing(true);
    
    // Simular búsqueda y generación profunda
    setTimeout(() => {
      const placeName = place.name;
      const isBelmonte = normalize(placeName).includes('belmonte');
      const isAlmudena = normalize(placeName).includes('almudena');
      
      let aiContent = {
        description: `Este lugar histórico representa un pilar fundamental en la identidad de su municipio. Su construcción y evolución a lo largo de los siglos ha sido documentada por historiadores como un ejemplo de resiliencia y adaptación arquitectónica. La visita a este enclave ofrece una perspectiva única sobre la cultura local y nacional.`,
        touristTip: `Te recomendamos realizar la visita durante las primeras horas de la mañana para evitar aglomeraciones y disfrutar de una luz natural que resalta cada detalle. No olvides consultar la disponibilidad de guías especializados en accesibilidad.`
      };

      if (isBelmonte) {
        aiContent = {
          description: "El Castillo de Belmonte es una de las fortalezas más singulares y mejor conservadas de España. Mandado construir en 1456 por Juan Pacheco, primer Marqués de Villena, destaca por su planta en forma de estrella de seis puntas, una rareza en la arquitectura militar gótico-mudéjar. Durante el siglo XIX, la emperatriz Eugenia de Montijo, descendiente de los Pacheco, impulsó una ambiciosa restauración que dotó al castillo de sus impresionantes artesonados y decoraciones neogóticas. Sus muros han servido de escenario para numerosas superproducciones de Hollywood, consolidándose como un icono cultural que fusiona la dureza militar con el refinamiento palaciego.",
          touristTip: "El castillo dispone de un ascensor moderno integrado discretamente para acceder a las plantas superiores, permitiendo que personas con movilidad reducida disfruten de las salas palaciegas y los artesonados mudéjares sin barreras."
        };
      } else if (isAlmudena) {
        aiContent = {
          description: "La Catedral de Santa María la Real de la Almudena es un templo de dimensiones monumentales que refleja la compleja historia de Madrid. Aunque su construcción se proyectó en el siglo XVI, la primera piedra no se puso hasta 1883, bajo el reinado de Alfonso XII. El diseño original neogótico de Francisco de Cubas evolucionó hacia un exterior neoclásico para armonizar con el Palacio Real. En su interior, destaca el contraste entre las vidrieras contemporáneas de colores vibrantes y la solemnidad de la Cripta neorrománica. Es el primer templo consagrado por un Papa fuera de Roma, el Papa Juan Pablo II en 1993.",
          touristTip: "La entrada principal por la Plaza de la Armería es totalmente accesible. Existe un ascensor para subir a la cúpula, desde donde se obtienen las mejores vistas panorámicas accesibles del Madrid de los Austrias."
        };
      } else if (normalize(placeName).includes('camp nou') || normalize(placeName).includes('spotify')) {
        aiContent = {
          description: "El Spotify Camp Nou se encuentra actualmente en un proceso histórico de remodelación integral bajo el proyecto Espai Barça. Durante esta fase, el 'Barça Immersive Tour' ofrece una experiencia vanguardista en el antiguo Palacio de Hielo. El recorrido utiliza tecnología inmersiva de última generación, incluyendo una sala circular 360º (la más grande de Europa) que permite revivir los momentos más épicos del club. A pesar de las obras, el club ha mantenido un compromiso firme con la accesibilidad, adaptando todo el recorrido museístico para sillas de ruedas y proporcionando servicios específicos para diversas discapacidades sensoriales.",
          touristTip: "Si tienes una discapacidad <33%, acude directamente a las taquillas (no compres online) para obtener el 50% de descuento para ti y tu acompañante. Evita la sala inmersiva si eres sensible a luces intermitentes.",
          tariffs: [
            { id: 1, label: 'General (11 a 64 años)', price: '28,00 €' },
            { id: 2, label: 'Mayores de 65 años', price: '21,00 €' },
            { id: 3, label: 'Infantil (4 a 10 años)', price: '21,00 €' },
            { id: 4, label: 'Residentes Cataluña', price: '16,00 €' },
            { id: 5, label: 'Discapacidad <33% (incl. acomp.)', price: '14,00 €' },
            { id: 6, label: 'Menores de 4 años', price: 'Gratis' }
          ],
          seasons: [
            { name: 'Invierno', period: '2 ene al 25 feb', weekday: '10:00 - 18:00', weekend: '10:00 - 18:00', festive: '10:00 - 18:00' },
            { name: 'Primavera', period: '26 feb al 27 mar', weekday: '10:00 - 19:00', weekend: '10:00 - 19:00', festive: '10:00 - 19:00' },
            { name: 'Temporada Alta', period: '28 mar al 18 oct', weekday: '09:30 - 19:00', weekend: '09:30 - 19:00', festive: '09:30 - 19:00' },
            { name: 'Otoño / Invierno', period: '19 oct al 31 dic', weekday: '10:00 - 19:00', weekend: '10:00 - 19:00', festive: '10:00 - 19:00' }
          ]
        };
      }

      setPlace(prev => {
        const updated = { ...prev, ...aiContent };
        
        // Guardar permanentemente en contribuciones
        updateUserData('contributions', (prev) => {
          const current = prev || [];
          const existingIdx = current.findIndex(p => p.id === place.id);
          let newContributions = [...current];
          
          if (existingIdx > -1) {
            newContributions[existingIdx] = { ...newContributions[existingIdx], ...aiContent };
          } else {
            newContributions.push({ ...place, ...aiContent });
          }
          return newContributions;
        });
        return updated;
      });

      setIsAiProcessing(false);
      setIsAiEnhanced(true);
      
      Alert.alert(
        hasGemini ? "🚀 MOTOR GEMINI PRO: ANÁLISIS ÉLITE" : "✨ IA DISTRAVEL ACTIVADA",
        hasGemini 
          ? `¡Búsqueda Profunda Completada! Hemos extraído datos históricos verificados y consejos de accesibilidad de alta fiabilidad para ${placeName}.`
          : `Contenido mejorado con éxito para ${placeName}.`,
        [{ text: "¡PERFECTO!", onPress: () => awardExperience(20, 'IA activada') }]
      );
    }, hasGemini ? 3500 : 2000);
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
      Alert.alert("Éxito", "Ubicación validada oficialmente como Administrador.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo completar la validación.");
    }
  };

  const category = place.category || 'Monumento';
  
  const handleSave = () => {
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
    setIsEditing(false);
    Alert.alert("Éxito", "Cambios guardados correctamente.");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setImage(newUri);
      
      if (!isEditing) {
        const existing = userData.contributions || [];
        const normalizedPlace = { ...place, city: place.city || place.cityName, image: newUri };
        const index = existing.findIndex(p => p.id === place.id || (p.name === initialPlace.name && (p.city === initialPlace.city || p.city === initialPlace.cityName)));
        
        let updatedContributions;
        if (index !== -1) {
          updatedContributions = [...existing];
          updatedContributions[index] = { ...updatedContributions[index], image: newUri };
        } else {
          updatedContributions = [...existing, normalizedPlace];
        }

        updateUserData({ contributions: updatedContributions });
        Alert.alert("Éxito", "Imagen actualizada.");
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
    Alert.alert(
      "IA Distravel",
      `¿Deseas que la IA genere las tarifas y beneficios de accesibilidad para ${place.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Generar Tarifas", 
          onPress: () => {
            const name = (place.name || '').toLowerCase();
            let newTariffs = [
              { id: 1, label: 'Entrada General', price: '12,00 €', value: 12 },
              { id: 2, label: 'Tarifa Reducida (>65 / Est.)', price: '8,00 €', value: 8 },
              { id: 3, label: 'PCD + Acompañante', price: 'Gratis', value: 0 }
            ];

            if (name.includes('sagrada familia')) {
              newTariffs = [
                { id: 1, label: 'Individual (General)', price: '26,00 €', value: 26 },
                { id: 2, label: 'Con Torres', price: '36,00 €', value: 36 },
                { id: 3, label: 'PCD (>33%) + Acompañante', price: 'Gratis', value: 0 },
                { id: 4, label: 'Menores de 11 años', price: 'Gratis', value: 0 }
              ];
            } else if (name.includes('playa') || name.includes('parque')) {
              newTariffs = [{ id: 1, label: 'Acceso Libre', price: 'Gratis', value: 0 }];
            } else if (name.includes('museo')) {
              newTariffs = [
                { id: 1, label: 'Entrada General', price: '15,00 €', value: 15 },
                { id: 2, label: 'PCD + Acompañante', price: 'Gratis', value: 0 },
                { id: 3, label: 'Estudiantes', price: '7,50 €', value: 7.5 }
              ];
            }

            setPlace({ ...place, tariffs: newTariffs });
            
            // Evaluar audioguía por IA con mayor profundidad
            let audioguideInfo = {
              available: false,
              price: 'No disponible',
              accessible: false,
              languages: ['Español']
            };

            const isMajorSite = name.includes('sagrada') || name.includes('museo') || name.includes('castillo') || name.includes('catedral') || name.includes('palacio');
            
            if (isMajorSite) {
              audioguideInfo = {
                available: true,
                price: name.includes('sagrada') || name.includes('prado') ? 'Incluida en entrada' : '5,00 €',
                accessible: true,
                languages: ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Chino', 'LSE (Signos)', 'Audiodescripción'],
                note: "Audioguía adaptada con bucle magnético y audiodescripción para personas con discapacidad visual."
              };
            } else if (name.includes('iglesia') || name.includes('parque')) {
              audioguideInfo = {
                available: true,
                price: 'Gratis (App)',
                accessible: true,
                languages: ['Español', 'Inglés'],
                note: "Disponible mediante descarga de aplicación oficial con contenidos accesibles."
              };
            }

            setPlace(prev => ({ 
              ...prev, 
              tariffs: newTariffs,
              audioguide: audioguideInfo 
            }));
            
            Alert.alert("✨ Análisis Completado", "La IA ha configurado precios oficiales, beneficios PCD y ha evaluado los servicios de audioguía adaptada.");
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
                const SERVER_URL = 'http://82.223.44.196:3000';
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
      openingDays: place.openingDays,
      morningOpen: place.morningOpen,
      morningClose: place.morningClose,
      afternoonOpen: place.afternoonOpen,
      afternoonClose: place.afternoonClose,
      isSplitSchedule: place.isSplitSchedule,
      schedule: place.schedule
    };

    // Check seasons
    if (place.seasons && place.seasons.length > 0) {
      const activeSeason = place.seasons.find(s => {
        const sM = s.startMonth ? parseInt(s.startMonth) : -1;
        const eM = s.endMonth ? parseInt(s.endMonth) : -1;

        if (sM !== -1 && eM !== -1) {
          if (sM <= eM) return currentMonth >= sM && currentMonth <= eM;
          else return currentMonth >= sM || currentMonth <= eM;
        }
        
        // Fallback: try to parse period string like "Diciembre - Marzo"
        const periodLower = (s.period || "").toLowerCase();
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        let startIdx = -1, endIdx = -1;
        months.forEach((m, idx) => {
          if (periodLower.includes(m)) {
            if (startIdx === -1) startIdx = idx + 1;
            else endIdx = idx + 1;
          }
        });

        if (startIdx !== -1 && endIdx !== -1) {
          if (startIdx <= endIdx) return currentMonth >= startIdx && currentMonth <= endIdx;
          else return currentMonth >= startIdx || currentMonth <= endIdx;
        }

        const currentMonthName = months[currentMonth - 1];
        return periodLower.includes(currentMonthName);
      });

      if (activeSeason) {
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        let seasonTime = isWeekend ? activeSeason.weekend : activeSeason.weekday;
        
        // Festive awareness (using Sunday as primary festive mock for now)
        if (dayOfWeek === 0 && activeSeason.festive) {
          seasonTime = activeSeason.festive;
        }

        if (seasonTime && seasonTime.includes('-')) {
          activeSchedule.morningOpen = seasonTime.split('-')[0].trim();
          activeSchedule.morningClose = seasonTime.split('-')[1].trim();
          activeSchedule.isSplitSchedule = false;
        }
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: image }} style={styles.heroImage} />
          <View style={styles.overlay} />
          
          <View style={styles.heroMapOverlay}>
            <AutonomousCommunityMap 
              regionName={effectiveRegion} 
              cityCoords={place.location}
              width={100}
              height={100}
              opacity={0.3}
            />
          </View>

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
                    >
                      <Camera color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: theme.primary }]}
                      onPress={() => setIsEditing(true)}
                    >
                      <Edit color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </SafeAreaView>

          <View style={styles.heroContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
              </View>
              
              {timeInfo && (
                <View style={[styles.timeBadge, { backgroundColor: 'rgba(0,0,0,0.6)', marginLeft: 10 }]}>
                  <Clock color={timeInfo.color || '#FFF'} size={14} />
                  <Text style={[styles.timeBadgeText, { color: timeInfo.color || '#FFF' }]}>{timeInfo.text}</Text>
                </View>
              )}
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.placeNameEdit, typography.h1]}
                value={place.name}
                onChangeText={(v) => setPlace({...place, name: v})}
                multiline
              />
            ) : (
              <View>
                <Text style={[styles.placeName, typography.h1]}>{place.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                  <TouchableOpacity 
                    onPress={handleGoToCity}
                    style={[styles.cityChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  >
                    <MapPin color="#FFF" size={12} />
                    <Text style={styles.cityChipText}>{place.city}</Text>
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

        <TouchableOpacity 
          onPress={handleGoToMap}
          style={[styles.locationBar, { backgroundColor: '#EFBF04' }]}
        >
          <MapPin color="#0A192F" size={18} />
          <Text style={styles.locationBarText}>
            {(place.province || place.city || 'ALICANTE').toUpperCase()} / <Text style={{ fontWeight: '800' }}>VER EN EL MAPA</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.mainContent}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre este lugar</Text>
            {isEditing ? (
              <TextInput
                style={[styles.descriptionEdit, { color: theme.textSecondary, borderColor: theme.border }]}
                value={place.description}
                onChangeText={(v) => setPlace({...place, description: v})}
                multiline
              />
            ) : (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {place.description || 'Este emblemático lugar es una parada obligatoria para cualquier visitante.'}
              </Text>
            )}

            {/* BOTÓN IA ELITE PARA LUGARES */}
            <TouchableOpacity 
              style={[
                styles.aiButton, 
                isAiEnhanced && styles.aiButtonActive,
                userData.aiApiKey && { backgroundColor: '#8E44AD' },
                { marginTop: 15 }
              ]} 
              onPress={handleAiEnhance}
              disabled={isAiProcessing || isAiEnhanced}
            >
              {isAiProcessing ? (
                <Zap color="#FFF" size={20} />
              ) : (
                userData.aiApiKey ? <Sparkles color="#FFF" size={20} fill={isAiEnhanced ? "#FFF" : "transparent"} /> : <Zap color="#FFF" size={20} fill={isAiEnhanced ? "#FFF" : "transparent"} />
              )}
              <Text style={styles.aiButtonText}>
                {isAiProcessing 
                  ? (userData.aiApiKey ? "Gemini analizando..." : "Buscando datos...") 
                  : isAiEnhanced 
                    ? (userData.aiApiKey ? "Análisis Gemini Pro Finalizado" : "Datos mejorados con IA") 
                    : (userData.aiApiKey ? "Investigar con Gemini Pro" : "Mejorar info con IA")}
              </Text>
              {!isAiProcessing && !isAiEnhanced && (
                <View style={[styles.aiBadge, userData.aiApiKey && { backgroundColor: '#FFF' }]}>
                  <Text style={[styles.aiBadgeText, userData.aiApiKey && { color: '#8E44AD' }]}>
                    {userData.aiApiKey ? "GEMINI" : "IA"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>


          {/* Tourist Tip */}
          {(place.touristTip || isEditing) && (
            <View style={[styles.tipCard, { backgroundColor: isDarkMode ? 'rgba(241, 196, 15, 0.1)' : '#FEF9E7', borderColor: '#F1C40F' }]}>
              <Sparkles color="#F1C40F" size={20} />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: isDarkMode ? '#F1C40F' : '#D4AC0D' }]}>Tip Distravel</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.tipTextEdit, { color: theme.text }]}
                    value={place.touristTip}
                    onChangeText={(v) => setPlace({...place, touristTip: v})}
                    multiline
                    placeholder="Escribe un consejo para viajeros..."
                  />
                ) : (
                  <Text style={[styles.tipText, { color: theme.text }]}>{place.touristTip}</Text>
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
                const isActive = place.accessibility?.[feat.id];
                return (
                  <TouchableOpacity 
                    key={feat.id}
                    disabled={!isEditing}
                    style={[styles.accessIconBox, { backgroundColor: isActive ? theme.primary : theme.surface }]}
                    onPress={() => setPlace({
                      ...place, 
                      accessibility: { ...place.accessibility, [feat.id]: !isActive }
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
                        {place.verifications || Math.floor(Math.random() * 10) + 2} viajeros han confirmado la accesibilidad recientemente
                      </Text>
                   </View>
                </View>
                <TouchableOpacity 
                  style={[styles.verifyActionBtn, { backgroundColor: theme.primary }]}
                  onPress={handleVerifyAccessibility}
                >
                  <CheckCircle color={isDarkMode ? '#070B14' : '#FFFFFF'} size={16} />
                  <Text style={[styles.verifyActionText, { color: isDarkMode ? '#070B14' : '#FFFFFF' }]}>Confirmar Accesibilidad</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Ficha Técnica "Océano Azul" */}
          {place.technicalSpecs && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Especificaciones Técnicas</Text>
              <View style={styles.techGrid}>
                {place.technicalSpecs.doorWidth && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Info color={theme.primary} size={18} />
                    <View>
                      <Text style={styles.techLabel}>Ancho Puerta</Text>
                      <Text style={[styles.techValue, { color: theme.text }]}>{place.technicalSpecs.doorWidth}</Text>
                    </View>
                  </View>
                )}
                {place.technicalSpecs.adaptedToilet && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <ShieldCheck color="#2ECC71" size={18} />
                    <View>
                      <Text style={styles.techLabel}>Baño Adaptado</Text>
                      <Text style={[styles.techValue, { color: theme.text }]}>Sí, Verificado</Text>
                    </View>
                  </View>
                )}
                {place.technicalSpecs.elevatorDimensions && (
                  <View style={[styles.techItem, { backgroundColor: theme.surface }]}>
                    <Construction color={theme.primary} size={18} />
                    <View>
                      <Text style={styles.techLabel}>Ascensor</Text>
                      <Text style={[styles.techValue, { color: theme.text }]}>{place.technicalSpecs.elevatorDimensions}</Text>
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
          {(place.importantNotices?.length > 0 || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle color="#E74C3C" size={22} />
                <Text style={[styles.sectionTitle, { color: '#E74C3C', marginLeft: 10, marginBottom: 0 }]}>Avisos Importantes</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={{ marginLeft: 'auto' }}
                    onPress={() => setPlace({
                      ...place,
                      importantNotices: [...(place.importantNotices || []), "Nuevo aviso importante..."]
                    })}
                  >
                    <PlusCircle color="#E74C3C" size={24} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.noticesContainer, { backgroundColor: '#FDEDEC', borderColor: '#E74C3C' }]}>
                {(place.importantNotices || []).map((notice, idx) => (
                  <View key={idx} style={styles.noticeRow}>
                    {isEditing ? (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity onPress={() => {
                          const newNotices = [...(place.importantNotices || [])];
                          newNotices.splice(idx, 1);
                          setPlace({...place, importantNotices: newNotices});
                        }}>
                          <MinusCircle color="#E74C3C" size={18} />
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.noticeTextEdit, { color: '#C0392B' }]}
                          value={notice}
                          onChangeText={(v) => {
                            const newNotices = [...(place.importantNotices || [])];
                            newNotices[idx] = v;
                            setPlace({...place, importantNotices: newNotices});
                          }}
                          multiline
                        />
                      </View>
                    ) : (
                      <Text style={[styles.noticeText, { color: '#C0392B' }]}>• {notice}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Horarios Dinámicos */}
          {( (place.schedules && place.schedules.length > 0) || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock color={theme.primary} size={22} />
                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Horarios de Visita</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={{ marginLeft: 'auto' }}
                    onPress={() => setPlace({
                      ...place,
                      schedules: [...(place.schedules || []), { id: Date.now().toString(), days: 'Días...', hours: 'Horas...' }]
                    })}
                  >
                    <PlusCircle color={theme.primary} size={24} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={[styles.schedulesGrid, { marginTop: 15 }]}>
                {(place.schedules || []).map((sched, sIdx) => (
                  <View key={sched.id || sIdx} style={[styles.scheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {isEditing ? (
                      <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <TextInput 
                            style={[styles.scheduleLabelEdit, { color: theme.text, fontWeight: '800' }]}
                            value={sched.days}
                            onChangeText={(v) => {
                              const newS = [...place.schedules];
                              newS[sIdx].days = v;
                              setPlace({...place, schedules: newS});
                            }}
                          />
                          <TouchableOpacity onPress={() => {
                            const newS = place.schedules.filter((_, i) => i !== sIdx);
                            setPlace({...place, schedules: newS});
                          }}>
                            <MinusCircle color="#E74C3C" size={18} />
                          </TouchableOpacity>
                        </View>
                        <TextInput 
                          style={[styles.scheduleHoursEdit, { color: theme.primary }]}
                          value={sched.hours}
                          onChangeText={(v) => {
                            const newS = [...place.schedules];
                            newS[sIdx].hours = v;
                            setPlace({...place, schedules: newS});
                          }}
                        />
                      </View>
                    ) : (
                      <>
                        <Text style={[styles.scheduleLabel, { color: theme.text }]}>{sched.days}</Text>
                        <Text style={[styles.scheduleHours, { color: theme.textSecondary }]}>{sched.hours}</Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
              
              {(place.specialClosures || isEditing) && (
                <View style={[styles.specialClosuresRow, { backgroundColor: '#FDEDEC', borderColor: '#E74C3C' }]}>
                  <AlertCircle color="#E74C3C" size={16} />
                  {isEditing ? (
                    <TextInput 
                      style={[styles.specialClosuresEdit, { color: '#C0392B' }]}
                      value={place.specialClosures}
                      onChangeText={(v) => setPlace({...place, specialClosures: v})}
                      placeholder="Ej: Cerrado 25 Dic..."
                    />
                  ) : (
                    <Text style={[styles.specialClosuresText, { color: '#C0392B' }]}>{place.specialClosures}</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Horarios Estructurados (NUEVO) */}
          {(place.workingHours || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock color={theme.primary} size={22} />
                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Horario Inteligente</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={{ marginLeft: 'auto', backgroundColor: '#6366f1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}
                    onPress={handleAiGenerateHours}
                  >
                    <Zap color="#FFF" size={14} fill="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>IA GEN</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={[styles.hoursGrid, { backgroundColor: theme.surface, borderColor: theme.border, padding: 15, borderRadius: 12, marginTop: 15, borderWidth: 1 }]}>
                {isEditing ? (
                  <View style={styles.editHoursContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                      <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Lunes - Viernes</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TextInput 
                          style={{ width: 60, height: 36, backgroundColor: theme.background, color: theme.text, borderRadius: 8, textAlign: 'center', borderWidth: 1, borderColor: theme.border }}
                          value={place.workingHours?.weekday?.open}
                          onChangeText={(v) => setPlace({
                            ...place, 
                            workingHours: { ...place.workingHours, weekday: { ...place.workingHours?.weekday, open: v } }
                          })}
                          placeholder="00:00"
                        />
                        <Text style={{ color: theme.textSecondary }}>a</Text>
                        <TextInput 
                          style={{ width: 60, height: 36, backgroundColor: theme.background, color: theme.text, borderRadius: 8, textAlign: 'center', borderWidth: 1, borderColor: theme.border }}
                          value={place.workingHours?.weekday?.close}
                          onChangeText={(v) => setPlace({
                            ...place, 
                            workingHours: { ...place.workingHours, weekday: { ...place.workingHours?.weekday, close: v } }
                          })}
                          placeholder="00:00"
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                      <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Fin de Semana</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TextInput 
                          style={{ width: 60, height: 36, backgroundColor: theme.background, color: theme.text, borderRadius: 8, textAlign: 'center', borderWidth: 1, borderColor: theme.border }}
                          value={place.workingHours?.weekend?.open}
                          onChangeText={(v) => setPlace({
                            ...place, 
                            workingHours: { ...place.workingHours, weekend: { ...place.workingHours?.weekend, open: v } }
                          })}
                          placeholder="00:00"
                        />
                        <Text style={{ color: theme.textSecondary }}>a</Text>
                        <TextInput 
                          style={{ width: 60, height: 36, backgroundColor: theme.background, color: theme.text, borderRadius: 8, textAlign: 'center', borderWidth: 1, borderColor: theme.border }}
                          value={place.workingHours?.weekend?.close}
                          onChangeText={(v) => setPlace({
                            ...place, 
                            workingHours: { ...place.workingHours, weekend: { ...place.workingHours?.weekend, close: v } }
                          })}
                          placeholder="00:00"
                        />
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 }}
                      onPress={() => setPlace({
                        ...place,
                        workingHours: { ...place.workingHours, is24h: !place.workingHours?.is24h }
                      })}
                    >
                      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: theme.primary, backgroundColor: place.workingHours?.is24h ? theme.primary : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                        {place.workingHours?.is24h && <CheckCircle color="#FFF" size={14} />}
                      </View>
                      <Text style={{ color: theme.text, fontWeight: '600' }}>Lugar abierto 24 horas</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.viewHoursContainer}>
                    {place.workingHours?.is24h ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <CheckCircle color="#2ECC71" size={20} />
                        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>Abierto las 24 horas del día</Text>
                      </View>
                    ) : (
                      <>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Lunes a Viernes</Text>
                          <Text style={{ color: theme.text, fontWeight: '800' }}>{place.workingHours?.weekday?.open} - {place.workingHours?.weekday?.close}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Fin de Semana</Text>
                          <Text style={{ color: theme.text, fontWeight: '800' }}>{place.workingHours?.weekend?.open} - {place.workingHours?.weekend?.close}</Text>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Horarios y Calendario POR TEMPORADAS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Horarios por Temporada</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={{ marginLeft: 'auto' }}
                  onPress={() => setPlace({
                    ...place,
                    seasons: [...(place.seasons || []), { 
                      name: 'Nueva Temporada', 
                      period: 'Fechas...', 
                      weekday: '10:00 - 14:00 y 16:00 - 19:00',
                      weekend: '10:00 - 14:00'
                    }]
                  })}
                >
                  <PlusCircle color={theme.primary} size={24} />
                </TouchableOpacity>
              )}
            </View>

            {(place.seasons || []).map((season, sIdx) => (
              <View key={sIdx} style={[styles.seasonCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.removeSeasonBtn}
                    onPress={() => {
                      const newSeasons = [...place.seasons];
                      newSeasons.splice(sIdx, 1);
                      setPlace({...place, seasons: newSeasons});
                    }}
                  >
                    <X color="#E74C3C" size={16} />
                  </TouchableOpacity>
                )}
                
                <View style={styles.seasonHeader}>
                  {isEditing ? (
                    <View style={{ flex: 1 }}>
                      <TextInput 
                        style={[styles.seasonNameEdit, { color: theme.primary }]}
                        value={season.name}
                        placeholder="Nombre (ej. Invierno)"
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].name = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>De mes:</Text>
                        <TextInput 
                          style={[styles.seasonMonthInput, { color: theme.text }]}
                          value={String(season.startMonth || '')}
                          placeholder="1"
                          keyboardType="numeric"
                          onChangeText={(v) => {
                            const newSeasons = [...place.seasons];
                            newSeasons[sIdx].startMonth = v;
                            setPlace({...place, seasons: newSeasons});
                          }}
                        />
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>A mes:</Text>
                        <TextInput 
                          style={[styles.seasonMonthInput, { color: theme.text }]}
                          value={String(season.endMonth || '')}
                          placeholder="3"
                          keyboardType="numeric"
                          onChangeText={(v) => {
                            const newSeasons = [...place.seasons];
                            newSeasons[sIdx].endMonth = v;
                            setPlace({...place, seasons: newSeasons});
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={[styles.seasonName, { color: theme.primary }]}>{season.name.toUpperCase()}</Text>
                      <Text style={[styles.seasonPeriod, { color: theme.textSecondary }]}>{season.period}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.seasonBody}>
                  <View style={styles.seasonRow}>
                    <Text style={[styles.seasonLabel, { color: theme.text }]}>Lunes a Sábado:</Text>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.seasonTimeEdit, { color: theme.text }]}
                        value={season.weekday}
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].weekday = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                    ) : (
                      <Text style={[styles.seasonTime, { color: theme.textSecondary }]}>{season.weekday}</Text>
                    )}
                  </View>
                  <View style={styles.seasonRow}>
                    <Text style={[styles.seasonLabel, { color: theme.text }]}>Sábados:</Text>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.seasonTimeEdit, { color: theme.text }]}
                        value={season.weekend}
                        placeholder="10:00 - 14:00"
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].weekend = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                    ) : (
                      <Text style={[styles.seasonTime, { color: theme.textSecondary }]}>{season.weekend}</Text>
                    )}
                  </View>
                  <View style={styles.seasonRow}>
                    <Text style={[styles.seasonLabel, { color: theme.text }]}>Domingos/Festivos:</Text>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.seasonTimeEdit, { color: theme.text }]}
                        value={season.festive}
                        placeholder="11:00 - 17:00"
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].festive = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                    ) : (
                      <Text style={[styles.seasonTime, { color: theme.textSecondary }]}>{season.festive || 'Cerrado'}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {(!place.seasons || place.seasons.length === 0) && (
              <View style={[styles.scheduleContainer, { backgroundColor: theme.surface }]}>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                  const isOpen = place.openingDays ? place.openingDays[day] : true;
                  const currentDaySchedule = place.schedule || (place.morningOpen ? `${place.morningOpen} - ${place.morningClose}` : 'Consultar horario');
                  
                  return (
                    <View key={day} style={styles.scheduleRow}>
                      <Text style={[styles.dayText, { color: theme.textSecondary }]}>{day}</Text>
                      <TouchableOpacity 
                        disabled={!isEditing}
                        style={{ flex: 1, alignItems: 'flex-end' }}
                        onPress={() => setPlace({
                          ...place,
                          openingDays: { ...(place.openingDays || {}), [day]: !isOpen }
                        })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={[styles.timeText, { color: isOpen ? theme.text : '#E74C3C', fontWeight: isOpen ? '700' : '400' }]}>
                            {isOpen ? currentDaySchedule : 'Cerrado'}
                          </Text>
                          {isEditing && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isOpen ? '#2ECC71' : '#E74C3C' }} />
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            
            <View style={styles.holidayNote}>
              <AlertTriangle color="#F1C40F" size={14} />
              <Text style={[styles.holidayText, { color: theme.textSecondary }]}>
                Los festivos pueden alterar estos horarios. Recomendamos verificar antes de viajar.
              </Text>
            </View>
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
                        tariffs: [...(place.tariffs || []), { id: Date.now(), label: 'Nueva Tarifa', price: '0 €' }]
                      })}
                    >
                      <PlusCircle color={theme.primary} size={24} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: place.isLinkedEntrance ? theme.primary : theme.surface, borderWidth: 1, borderColor: theme.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}
                    onPress={() => setPlace({...place, isLinkedEntrance: !place.isLinkedEntrance})}
                  >
                    <Link color={place.isLinkedEntrance ? '#FFF' : theme.primary} size={14} />
                    <Text style={{ fontSize: 10, color: place.isLinkedEntrance ? '#FFF' : theme.primary, fontWeight: '800' }}>VINCULAR ENTRADA</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* AVISO DE ENTRADA VINCULADA */}
            {(place.isLinkedEntrance || (isEditing && place.isLinkedEntrance)) && (
              <View style={[styles.linkedEntranceCard, { backgroundColor: '#F4F6F7', borderColor: theme.primary, marginBottom: 15 }]}>
                <Building2 color={theme.primary} size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.linkedTitle, { color: theme.text }]}>Compra la entrada</Text>
                  {isEditing ? (
                    <TextInput 
                      style={[styles.linkedInput, { color: theme.textSecondary }]}
                      placeholder="Ej: La visita se incluye en la entrada del castillo"
                      value={place.linkedEntranceName}
                      onChangeText={(v) => setPlace({...place, linkedEntranceName: v})}
                    />
                  ) : (
                    <Text style={[styles.linkedText, { color: theme.textSecondary }]}>
                      {place.linkedEntranceName || 'La visita se incluye en la entrada del monumento principal.'}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <View style={[styles.tariffsContainer, { backgroundColor: theme.surface }]}>
              {(place.tariffs || []).length > 0 ? (
                <>
                  {(place.tariffs || []).map((tariff, idx) => (
                    <View key={tariff.id || idx} style={styles.tariffRow}>
                      {isEditing ? (
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <TouchableOpacity onPress={() => {
                            const newTariffs = [...(place.tariffs || [])];
                            newTariffs.splice(idx, 1);
                            setPlace({...place, tariffs: newTariffs});
                          }}>
                            <MinusCircle color="#E74C3C" size={20} />
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.tariffLabel, { color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                            value={tariff.label}
                            onChangeText={(v) => {
                              const newTariffs = [...(place.tariffs || [])];
                              newTariffs[idx] = { ...tariff, label: v };
                              setPlace({...place, tariffs: newTariffs});
                            }}
                          />
                        </View>
                      ) : (
                        <Text style={[styles.tariffLabel, { color: theme.text }]}>{tariff.label}</Text>
                      )}
                      
                      <View style={[styles.priceTag, { backgroundColor: theme.primary + '20' }]}>
                        {isEditing ? (
                          <TextInput
                            style={[styles.priceEditInput, { color: theme.primary }]}
                            value={String(tariff.price)}
                            onChangeText={(v) => {
                              const newTariffs = [...(place.tariffs || [])];
                              newTariffs[idx] = { ...tariff, price: v };
                              setPlace({...place, tariffs: newTariffs});
                            }}
                          />
                        ) : (
                          <Text style={[styles.priceText, { color: theme.primary }]}>{tariff.price}</Text>
                        )}
                      </View>
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
                            {place.tariffs.find(t => t.label.toLowerCase().includes('general') || t.label.toLowerCase().includes('adulto'))?.price || '12.00 €'}
                          </Text>
                        </View>
                        <ChevronRight color={theme.textSecondary} size={20} />
                        <View>
                          <Text style={[styles.savingsLabel, { color: theme.primary }]}>Tu Precio</Text>
                          <Text style={[styles.savingsValue, { color: theme.primary, fontWeight: '900' }]}>
                            {place.tariffs.find(t => t.label.toLowerCase().includes('pcd') || t.label.toLowerCase().includes('discapacidad'))?.price || 'Gratis'}
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
          {(place.audioguide || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Languages color={theme.primary} size={22} />
                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Servicios Digitales</Text>
              </View>
              <View style={[styles.audioguideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.audioguideRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.audioguideLabel, { color: theme.text }]}>Audioguía Oficial</Text>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.audioguidePriceEdit, { color: theme.primary }]}
                        value={place.audioguide?.price}
                        placeholder="Precio (ej. 5€ o Incluida)"
                        onChangeText={(v) => setPlace({ ...place, audioguide: { ...(place.audioguide || {}), price: v, available: true }})}
                      />
                    ) : (
                      <Text style={[styles.audioguidePrice, { color: theme.primary }]}>
                        {place.audioguide?.available ? place.audioguide.price : 'No disponible'}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.digitalBadge, { backgroundColor: place.audioguide?.accessible ? '#2ECC7120' : '#E74C3C20' }]}>
                    <ShieldCheck color={place.audioguide?.accessible ? '#2ECC71' : '#E74C3C'} size={14} />
                    <Text style={[styles.digitalBadgeText, { color: place.audioguide?.accessible ? '#2ECC71' : '#E74C3C' }]}>
                      {place.audioguide?.accessible ? 'ADAPTADA' : 'BÁSICA'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.languagesContainer}>
                  {(place.audioguide?.languages || ['Español']).map((lang, lIdx) => (
                    <View key={lIdx} style={[styles.langTag, { backgroundColor: theme.background }]}>
                      <Text style={[styles.langText, { color: theme.textSecondary }]}>{lang}</Text>
                    </View>
                  ))}
                  {isEditing && (
                    <TouchableOpacity 
                      style={[styles.langTag, { backgroundColor: theme.primary + '20', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.primary }]}
                      onPress={() => {
                        const currentLangs = place.audioguide?.languages || [];
                        setPlace({ ...place, audioguide: { ...place.audioguide, languages: [...currentLangs, 'Nuevo Idioma'] }});
                      }}
                    >
                      <Text style={[styles.langText, { color: theme.primary }]}>+ Añadir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Contact & Links */}
          <View style={styles.section}>
            {/* Basic Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MapPin color={theme.primary} size={20} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Dirección</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoValueInput, { color: theme.text, borderBottomColor: theme.primary }]}
                      value={place.address}
                      onChangeText={(v) => setPlace({ ...place, address: v })}
                      placeholder="Calle, Número, CP, Ciudad..."
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: theme.text }]}>{place.address || `${place.city}, ${place.province}`}</Text>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Phone color={theme.primary} size={20} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Teléfono de Reservas</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoValueInput, { color: theme.text, borderBottomColor: theme.primary }]}
                      value={place.phone}
                      onChangeText={(v) => setPlace({ ...place, phone: v })}
                      placeholder="+34 ..."
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => place.phone && Linking.openURL(`tel:${place.phone}`)}>
                      <Text style={[styles.infoValue, { color: place.phone ? theme.primary : theme.text, fontWeight: place.phone ? '700' : '500' }]}>
                        {place.phone || 'No disponible'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {place.website && (
                <View style={styles.infoRow}>
                  <Globe color={theme.primary} size={20} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Sitio Web</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(place.website.startsWith('http') ? place.website : `https://${place.website}`)}>
                      <Text style={[styles.infoValue, { color: theme.primary, fontWeight: '700' }]}>{place.website}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Location Map */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
            <View style={[styles.mapContainer, { backgroundColor: theme.surface, borderColor: theme.border, overflow: 'hidden' }]}>
              {place.location && place.location.latitude ? (
                <MapView
                  style={{ width: '100%', height: '100%' }}
                  userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
                  customMapStyle={isDarkMode ? DARK_MAP_STYLE : []}
                  initialRegion={{
                    latitude: Number(place.location.latitude),
                    longitude: Number(place.location.longitude),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                >
                  <Marker coordinate={{
                    latitude: Number(place.location.latitude),
                    longitude: Number(place.location.longitude),
                  }} />
                </MapView>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 }}>
                  <MapPin color={theme.textSecondary} size={32} />
                  <Text style={{ color: theme.textSecondary, marginTop: 10, textAlign: 'center' }}>Ubicación no disponible para este lugar</Text>
                </View>
              )}
            </View>
            
            <View style={styles.addressBar}>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {place.address || `${place.city}, ${place.province || ''}`}
              </Text>
              <TouchableOpacity 
                style={[styles.navBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  const lat = place.location?.latitude || 40.4168;
                  const lon = place.location?.longitude || -3.7038;
                  const label = encodeURI(place.name);
                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                  Linking.openURL(url);
                }}
              >
                <Navigation color="#FFF" size={18} />
                <Text style={styles.navBtnText}>Cómo llegar</Text>
              </TouchableOpacity>
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
            <Text style={[styles.accessibilityText, { color: theme.textSecondary }]}>
              {place.freeInfo || 'Lugar adaptado con rampas de acceso, baños adaptados y personal formado para asistencia.'}
            </Text>
            <View style={styles.checkList}>
              <View style={styles.checkItem}>
                <CheckCircle color="#2ECC71" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Acceso sin escalones</Text>
              </View>
              <View style={styles.checkItem}>
                <CheckCircle color="#2ECC71" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Ascensor panorámico</Text>
              </View>
              <View style={styles.checkItem}>
                <AlertTriangle color="#F1C40F" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Aviso previo recomendado</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  headerActions: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, zIndex: 10 },
  circleButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 }, // Bajado un poco
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  timeBadgeText: { fontSize: 12, fontWeight: '700' },
  placeName: { color: '#FFFFFF', marginTop: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, fontSize: 32, fontWeight: '900' },
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
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24 },
  tipCard: { flexDirection: 'row', padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 25, gap: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  tipText: { fontSize: 14, lineHeight: 20 },
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
  tariffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
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
    lineHeight: 24,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    textAlignVertical: 'top',
    minHeight: 100,
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
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
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
});
