import React, { useState, useEffect, useMemo } from 'react';
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
  Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
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
  Sun,
  Moon,
  CloudRain,
  Thermometer,
  Wind
} from 'lucide-react-native';
import { MONUMENTOS } from '../data/monumentos';
import { CIUDADES_PREMIUM } from '../data/ciudades';
import { typography } from '../theme/typography';
import { calculatePlaceSavings } from '../utils/savings';
import * as ImagePicker from 'expo-image-picker';

import * as Location from 'expo-location';
import { AutonomousCommunityMap } from '../components/AutonomousCommunityMap';
import { PROVINCE_TO_REGION } from '../data/provinces';
import { getFiestaPatronal } from '../data/fiestasPatronales';
import { getPoblacion } from '../data/poblacion';
import { REAL_CITY_DATA } from '../data/municipiosIA';

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
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>{content}</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export function CityDetailScreen({ route, navigation }) {
  const { city } = route.params;
  const { theme } = useTheme();
  const { userData, updateUserData } = useUser();
  const isAdmin = userData?.isAdmin || false;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: '', icon: Info });
  const [cityCoords, setCityCoords] = useState(null);

  const normalize = (text) => {
    if (!text) return '';
    return text.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i');
  };

  // Combinar datos oficiales con persistencia personalizada de Admin
  const cityKey = normalize(city.name);
  const customData = userData?.customCityData?.[cityKey] || {};
  
  // Enriquecer con datos Premium si coinciden (por si se navega desde búsqueda general)
  const premiumMatch = Object.entries(CIUDADES_PREMIUM).find(([name]) => normalize(name) === cityKey)?.[1] || {};

  const [tempCityData, setTempCityData] = useState({
    ...city,
    ...premiumMatch,
    ...customData
  });

  // Determinar la región si falta
  const effectiveRegion = useMemo(() => {
    if (tempCityData.region) return tempCityData.region;
    if (tempCityData.province) return PROVINCE_TO_REGION[tempCityData.province] || tempCityData.province;
    return tempCityData.name || 'Ciudad'; // Fallback dinámico
  }, [tempCityData.region, tempCityData.province]);

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

  const fiestaData = useMemo(() => getFiestaPatronal(tempCityData.name), [tempCityData.name]);
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
    const matchingKey = Object.keys(MONUMENTOS).find(k => {
      const normalizedK = normalize(k);
      // Soporte bilingüe exacto: Alicante/Alacant, Castellón/Castelló, etc.
      return normalizedK === cName || 
             (normalizedK === 'alicante' && cName === 'alacant') ||
             (normalizedK === 'castellon' && cName === 'castello');
    });
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
  const visibleUserNames = new Set(visibleUserContributions.map(p => p.name.toLowerCase()));

  const allPlaces = [
    ...visibleUserContributions,
    ...officialPlaces.filter(p => !visibleUserNames.has(p.name.toLowerCase()))
  ];

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
      setTempCityData(prev => ({ ...prev, image: result.assets[0].uri }));
      Alert.alert("¡Imagen actualizada!", "La foto se guardará permanentemente.");
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
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);

  // Datos de contexto (Simulados para el Store)
  const cityContextData = React.useMemo(() => {
    const name = tempCityData.name || city.name;
    const popRaw = getPoblacion(name);
    // Extraer solo el número o limpiar el texto para el badge
    const popFormatted = popRaw.replace(' hab.', '').replace(' (aprox.)', '');
    
    return { pop: popFormatted, temp: '22°C', status: 'sunny' };
  }, [tempCityData.name, city.name]);

  const renderWeatherIcon = (status, size = 16, color = "#FFF") => {
    switch (status) {
      case 'sunny': return <Sun color={color} size={size} />;
      case 'cloudy': return <Cloud color={color} size={size} />;
      case 'rainy': return <CloudRain color={color} size={size} />;
      case 'night': return <Moon color={color} size={size} />;
      default: return <Sun color={color} size={size} />;
    }
  };

  const handleAiEnhance = () => {
    setIsAiProcessing(true);
    const cityName = tempCityData.name || city.name || 'esta ciudad';
    const cityKey = normalize(cityName);
    const province = tempCityData.province || 'España';
    const region = tempCityData.region || 'España';
    
    console.log(`Distravel AI: Analizando datos reales para ${cityName}...`);
    
    // Simular latencia
    setTimeout(() => {
      const realData = REAL_CITY_DATA[cityKey];
      
      if (realData) {
        setTempCityData(prev => ({
          ...prev,
          history: realData.history,
          geography: realData.geography,
          climate: realData.climate,
          landscape: realData.landscape,
          gastronomy: realData.gastronomy,
          festivities: realData.festivities
        }));
      } else {
        const regionalContext = {
          history: `La historia de ${cityName} está ligada a la provincia de ${province}. Como parte de la región de ${region}, ha sido testigo de los procesos de repoblación medieval y el desarrollo agrícola que define este territorio. Su patrimonio refleja la arquitectura típica de la zona.`,
          geography: `${cityName} se integra en la geografía de ${province}. Su ubicación en ${region} le confiere un relieve que combina la orografía local con los accidentes geográficos propios de esta zona.`,
          climate: `El clima en ${cityName} es el propio de ${province}, caracterizado por ser un clima ${region.includes('Mediterránea') ? 'Mediterráneo con veranos secos' : 'Continental con marcadas oscilaciones térmicas'}.`,
          landscape: `El entorno de ${cityName} ofrece un paisaje dominado por la flora de ${region}. Desde las tierras de cultivo hasta los parajes naturales protegidos de ${province}, invita a la contemplación.`,
          gastronomy: `La gastronomía en ${cityName} se nutre de la despensa de ${province}. Destacan los productos de temporada y los guisos tradicionales de la región de ${region}.`,
          festivities: `Las festividades de ${cityName} celebran la identidad de sus gentes a través de tradiciones compartidas con el resto de ${province}. El calendario festivo está marcado por eventos populares inclusivos.`
        };

        setTempCityData(prev => ({
          ...prev,
          ...regionalContext
        }));
      }
      
      setIsAiProcessing(false);
      setIsAiEnhanced(true);
      Alert.alert("IA: Análisis Completado", `Datos reales y contexto regional aplicados para ${cityName}.`);
    }, 1500);
  };

  const oldHandleAiEnhance_Removed = () => { // Placeholder for removal logic if needed
    const hasGemini = userData.aiApiKey && userData.aiApiKey.length > 10;
    setIsAiProcessing(true);
    console.log(`Distravel AI: Iniciando análisis para ${tempCityData.name}...`);
    
    // Simular procesamiento inteligente basado en el nombre de la ciudad
    setTimeout(() => {
      const cityName = tempCityData.name || city.name || 'esta ciudad';
      const cityNameUpper = cityName.toUpperCase();
      
      // Motor de Generación de Contenido Avanzado (Simulación Gemini Pro)
      const generateRichHistory = (name) => {
        return `La historia de ${name} es un fascinante tapiz tejido a lo largo de milenios, donde cada capa arqueológica revela un capítulo crucial de la civilización occidental. Desde los asentamientos de la Edad del Bronce hasta su florecimiento bajo el dominio romano y la posterior impronta de la cultura andalusí, el municipio ha sido un crisol de culturas. Su evolución durante la Reconquista y su consolidación como villa real o enclave señorial le confirió una arquitectura civil y militar que hoy constituye un museo al aire libre. Cada callejón y sillar de sus monumentos narra historias de resiliencia, comercio y arte que han forjado el carácter indómito de sus gentes, convirtiendo a ${name} en un destino imprescindible para entender el legado histórico de la península.`;
      };

      const generateRichGeography = (name) => {
        return `Situado en una ubicación privilegiada que ha condicionado su destino desde tiempos ancestrales, ${name} presenta una orografía de contrastes sublimes. Se asienta sobre un relieve que alterna zonas de vega fértil con estribaciones montañosas que actúan como guardianes naturales del casco urbano. Su hidrografía, marcada por ríos o acuíferos históricos, no solo ha definido su agricultura sino que ha creado parajes de una belleza plástica singular. El urbanismo del municipio se ha adaptado magistralmente a esta topografía, creando una simbiosis perfecta entre la naturaleza y la mano del hombre, donde la altitud y la orientación proporcionan miradores naturales que ofrecen algunas de las panorámicas más espectaculares de la región.`;
      };

      const generateRichClimate = (name) => {
        return `El clima de ${name} se define por una benignidad característica que invita a la exploración durante todas las estaciones. Con una insolación media envidiable, la luminosidad de sus cielos ha sido fuente de inspiración para artistas y viajeros. Sus inviernos, suaves y cortos, permiten disfrutar de la accesibilidad urbana sin las restricciones del frío extremo, mientras que sus veranos, moderados por brisas locales o la altitud, mantienen una temperatura ideal para el ocio al aire libre. Esta estabilidad meteorológica no solo favorece el bienestar de sus habitantes, sino que convierte a ${name} en un refugio climatológico perfecto para personas que buscan un entorno saludable y predecible para sus viajes de turismo accesible.`;
      };

      const generateRichLandscape = (name) => {
        return `El paisaje de ${name} es una sinfonía visual de biodiversidad y patrimonio. Es un entorno donde el verde de su flora autóctona se funde con los tonos ocres de su piedra histórica y el azul de su horizonte. Los parques y zonas verdes urbanas han sido diseñados siguiendo criterios de sostenibilidad y accesibilidad universal, permitiendo que todos los ciudadanos y visitantes disfruten de espacios de sombra, descanso y contemplación. La integración de rutas accesibles que conectan el núcleo urbano con los parajes naturales circundantes permite una inmersión total en un ecosistema preservado, donde la fauna local y la flora estacional crean un espectáculo natural que cambia cromáticamente con el paso de los meses.`;
      };

      const generateRichGastronomy = (name) => {
        return `La mesa en ${name} es un homenaje al producto de proximidad y a la herencia culinaria transmitida de generación en generación. Su gastronomía se sustenta en la excelencia de las materias primas de su propia tierra, ofreciendo una dieta equilibrada y llena de sabor. Platos de cuchara que reconfortan el alma se combinan con asados tradicionales y una repostería artesanal que conserva los secretos de los antiguos hornos locales. La oferta gastronómica no solo es una experiencia sensorial, sino un acto cultural en sí mismo, donde las tabernas históricas y los restaurantes modernos compiten por ofrecer la mejor interpretación de los sabores auténticos, siempre con un compromiso inquebrantable con la calidad y la hospitalidad.`;
      };

      const generateRichFestivities = (name) => {
        return `Las celebraciones en ${name} son el reflejo del alma vibrante y acogedora de su comunidad. El calendario festivo es una sucesión de eventos donde la música, el color y la tradición invaden las plazas y calles en un estallido de alegría colectiva. Desde las procesiones solemnes que muestran el valor artístico de su imaginería hasta las verbenas populares llenas de luz y danzas tradicionales, cada fiesta es una oportunidad para compartir el orgullo de pertenecer a esta tierra. Estas festividades han sido adaptadas para garantizar que sean inclusivas y accesibles, permitiendo que todas las personas, independientemente de sus capacidades, puedan participar plenamente en el tejido social y cultural que define la identidad de ${name}.`;
      };

      let aiGeneratedData = {
        history: generateRichHistory(cityName),
        geography: generateRichGeography(cityName),
        climate: generateRichClimate(cityName),
        landscape: generateRichLandscape(cityName),
        gastronomy: generateRichGastronomy(cityName),
        festivities: generateRichFestivities(cityName),
        transports: { bus: true, taxi: true, tram: false, train: false, plane: false }
      };

      const isAlicante = normalize(cityName).includes('alicante');
      const isMadrid = normalize(cityName).includes('madrid');
      const isMorella = normalize(cityName).includes('morella');
      
      if (isAlicante) {
        aiGeneratedData = {
          history: "Alicante, la antigua Lucentum romana, es una ciudad con una trayectoria milenaria marcada por su puerto estratégico y la vigilancia eterna desde el Castillo de Santa Bárbara. A lo largo de los siglos, ha sido testigo de la presencia cartaginesa, romana, árabe y cristiana, consolidándose como una de las plazas fuertes más disputadas del Levante español. Su importancia comercial floreció en el siglo XVIII, dejando un legado arquitectónico civil de gran valor, como el Ayuntamiento barroco. Hoy, Alicante fusiona sus raíces históricas con una modernidad vibrante, manteniendo viva su identidad mediterránea a través de la conservación de sus barrios tradicionales como Santa Cruz.",
          geography: "Asentada a orillas del Mar Mediterráneo, Alicante disfruta de una orografía singular donde el monte Benacantil preside el paisaje urbano. La ciudad se extiende a lo largo de una bahía protegida, flanqueada por cabos como el Cabo de las Huertas que ofrecen una protección natural contra los vientos. El relieve es suave en el litoral, con amplias playas de arena dorada como San Juan y Postiguet, mientras que el interior se eleva hacia las estribaciones de la Cordillera Bética. Esta ubicación privilegiada la convierte en un balcón natural al mar, con un puerto que ha sido el corazón económico de la región durante siglos.",
          climate: "Alicante disfruta de un microclima mediterráneo excepcional que la sitúa entre las ciudades con mejor meteorología de Europa. Con más de 3.000 horas de sol al año y una temperatura media anual de 18°C, el invierno es prácticamente inexistente en la capital. Las precipitaciones son escasas y se concentran principalmente en otoño, dejando paso a cielos despejados el resto del año. Esta benignidad climática favorece un estilo de vida al aire libre y permite el turismo de accesibilidad en cualquier estación, sin las restricciones que imponen los climas más extremos del interior peninsular.",
          landscape: "El contraste visual en Alicante es fascinante: desde el azul intenso del Mediterráneo hasta el ocre de sus formaciones rocosas. La 'Cara del Moro', una silueta natural en el Castillo de Santa Bárbara, es el icono indiscutible del paisaje alicantino. La Explanada de España, con su mosaico ondulante que imita las olas del mar, es uno de los paseos más bellos de España, sombreado por majestuosas palmeras. El entorno se completa con parques urbanos como Canalejas y El Palmeral, auténticos oasis que oxigenan la ciudad y ofrecen espacios de sombra y descanso accesibles para todos.",
          gastronomy: "Alicante es, por derecho propio, la capital mundial del arroz. Su cocina se basa en la excelencia del producto de proximidad, tanto del mar como de la huerta. Imprescindibles son el Arroz a Banda, el Arroz del Senyoret o la Olleta Alicantina, platos que resumen la esencia del Levante. El pescado fresco de la lonja, como la gamba roja de Denia o los salazones, son piezas clave en su recetario. No se puede olvidar el Turrón de Jijona y Alicante, una herencia árabe que ha traspasado fronteras, ni sus vinos con Denominación de Origen, que maridan a la perfección con la huerta local.",
          festivities: "Las Hogueras de San Juan, declaradas de Interés Turístico Internacional, son el alma de la ciudad cada mes de junio. Monumentos artísticos de cartón piedra arden en la noche de la cremà, simbolizando la purificación y la llegada del verano. Otras celebraciones de gran calado incluyen la Romería de la Santa Faz, que congrega a miles de peregrinos en el segundo jueves tras Semana Santa, y las fiestas de Moros y Cristianos en los barrios de la ciudad. Estas festividades son un despliegue de música, color y tradición que transforman las calles en un escenario vivo de la cultura popular.",
          transports: { bus: true, taxi: true, tram: true, train: true, plane: true }
        };
      } else if (isMadrid) {
        aiGeneratedData = {
          history: "Capital de España desde 1561 por decisión de Felipe II, Madrid es el corazón político, económico y cultural del país. Su historia es una crónica de la transformación de una pequeña villa castellana en una metrópoli imperial que albergó el Siglo de Oro literario y artístico. Madrid ha superado asedios, ha liderado revoluciones culturales como la Movida y se ha reinventado constantemente a través de su arquitectura, desde el Madrid de los Austrias hasta los rascacielos de la Castellana. Es una ciudad que abraza a todos, donde la historia se respira en cada rincón del Palacio Real, la Puerta del Sol o la majestuosa Plaza Mayor.",
          geography: "Ubicada en el centro geográfico de la Península Ibérica, Madrid se asienta sobre la Meseta Central a una altitud media de 650 metros sobre el nivel del mar. La ciudad está surcada por el río Manzanares, cuyo entorno ha sido recuperado como un gran pulmón verde lineal. Su ubicación estratégica en el centro del país la convierte en el kilómetro cero de todas las infraestructuras españolas. Al norte, la Sierra de Guadarrama ofrece un telón de fondo montañoso espectacular que suaviza el horizonte urbano y proporciona recursos naturales esenciales para la capital.",
          climate: "El clima de Madrid es mediterráneo continentalizado, caracterizado por inviernos fríos y veranos muy calurosos. Sin embargo, su cielo se describe frecuentemente como uno de los más bellos del mundo, con un azul profundo capturado magistralmente por Velázquez. La baja humedad relativa hace que el calor sea más llevadero que en la costa, y las noches madrileñas, especialmente en primavera y otoño, ofrecen temperaturas ideales para disfrutar de la ciudad. Es un clima de contrastes marcados que define el carácter dinámico y enérgico de sus habitantes.",
          landscape: "Madrid es una de las capitales más arboladas del mundo. El Parque del Retiro, recientemente nombrado Paisaje de la Luz por la UNESCO, es un santuario verde de valor incalculable en el centro de la ciudad. El paisaje urbano es una mezcla armoniosa de palacios neoclásicos, iglesias barrocas y vanguardia arquitectónica. El eje Prado-Recoletos ofrece un paseo cultural sin parangón, mientras que zonas modernas como Madrid Río o la Casa de Campo proporcionan extensiones inmensas para el ocio inclusivo. El 'skyline' de Madrid, con sus torres icónicas, es una de las postales más reconocibles de la Europa moderna.",
          gastronomy: "La gastronomía madrileña es el resultado de siglos de influencias de todas las regiones de España, destiladas en una cocina con personalidad propia. El Cocido Madrileño, servido en tres vuelcos, es el plato rey, seguido de cerca por los Callos a la Madrileña y el castizo Bocadillo de Calamares en la Plaza Mayor. Madrid es también el mayor mercado de pescado de Europa (después de Tokio), lo que garantiza una calidad excepcional en sus productos marinos. Los postres como las Rosquillas de San Isidro, los Barquillos y el chocolate con churros en San Ginés completan una oferta culinaria infinita y acogedora.",
          festivities: "Las fiestas de San Isidro Labrador, patrón de la villa, llenan la ciudad de chulapos, organillos y verbenas cada 15 de mayo en la Pradera de San Isidro. Es un momento donde Madrid saca a relucir su orgullo más tradicional y castizo. Otras citas ineludibles son la Verbena de la Paloma en agosto, el Dos de Mayo (día de la Comunidad) y las celebraciones navideñas que culminan con las doce uvas en la Puerta del Sol. La oferta cultural se complementa con festivales de música, teatro y arte que mantienen a Madrid como una de las ciudades más vibrantes y festivas del mundo durante todo el año.",
          transports: { bus: true, taxi: true, tram: true, train: true, plane: true }
        };
      } else if (isMorella) {
        aiGeneratedData = {
          history: "Morella es una de las joyas medievales más imponentes de España, una ciudad-fortaleza que ha sido testigo mudo de la historia desde la Prehistoria hasta las Guerras Carlistas. Su imponente castillo, que corona el cerro cónico sobre el que se asienta la villa, ha sido codiciado por íberos, romanos, árabes y cristianos. Fue en Morella donde Blasco de Alagón y Jaume I pactaron la expansión del Reino de Valencia, y sus murallas de más de dos kilómetros de perímetro siguen custodiando hoy un laberinto de calles góticas y palacios que son Patrimonio de la Humanidad. Su historia es una mezcla de épica militar y devoción religiosa, simbolizada en su majestuosa Basílica Arciprestal.",
          geography: "Situada a una altitud de 984 metros, Morella preside la comarca de Els Ports como una atalaya inexpugnable. Su geografía es abrupta y dramática, caracterizada por muelas y valles profundos esculpidos por el paso del tiempo. La ciudad se adapta a la pendiente del terreno de forma magistral, escalonándose en la ladera para maximizar sus defensas naturales. Esta ubicación en un nudo de comunicaciones estratégico entre el valle del Ebro y el Mediterráneo le confiere unas vistas panorámicas que abarcan kilómetros de naturaleza salvaje, donde los bosques de encinas y robles conviven con una orografía rocosa que parece sacada de una leyenda medieval.",
          climate: "El clima de Morella es mediterráneo de alta montaña, ofreciendo una experiencia climática auténtica y vigorizante. Los inviernos son fríos y frecuentemente nos regalan paisajes nevados que transforman la villa en un escenario de cuento de hadas, mientras que los veranos son frescos y luminosos, convirtiendo a Morella en un refugio ideal para escapar del sofocante calor del litoral. Sus cielos limpios y la pureza de su aire son un bálsamo para el viajero. Es un clima que invita a la contemplación junto a la chimenea en invierno y a las caminatas bajo el sol suave de la montaña en el estío.",
          landscape: "El paisaje morellano es una sinfonía de piedra y verde. Desde cualquier punto de sus murallas, la mirada se pierde en un horizonte de relieves quebrados y barrancos espectaculares. La silueta del castillo recortada contra el cielo azul es la imagen icónica de la región. El entorno natural es rico en flora endémica y fauna protegida, como el buitre leonado que patrulla sus cielos. La integración del patrimonio arquitectónico con la roca viva crea un paisaje cultural único, donde la mano del hombre no ha roto la armonía, sino que ha elevado la belleza natural a una categoría artística monumental.",
          gastronomy: "La gastronomía de Morella es el sabor de la montaña en estado puro. Es famosa por su 'trufa negra' (el diamante de la cocina), que aromatiza platos durante todo el invierno. Imprescindibles son sus 'croquetas morellanas', con su característica forma triangular, y el 'flaó', un dulce de herencia árabe elaborado con requesón y miel que es el emblema de la villa. Los embutidos artesanales, la miel de milflores y los quesos curados de oveja completan una despensa rica y contundente, diseñada para nutrir el cuerpo y deleitar el paladar tras una jornada de exploración por sus cuestas góticas.",
          festivities: "Morella vive por y para sus tradiciones, siendo el 'Sexenni' su celebración más extraordinaria, declarada Fiesta de Interés Turístico Nacional. Se celebra cada seis años en honor a la Virgen de la Vallivana y transforma la ciudad en un museo de papel rizado y tapices hechos a mano. El 'Anunci' precede a este gran evento un año antes con una espectacular batalla de confeti. Otras fiestas como Sant Antoni, con su característica 'Santantonà', mantienen vivos rituales ancestrales de fuego y representación teatral medieval, demostrando que en Morella el tiempo no pasa, sino que se celebra con una intensidad y devoción únicas.",
          transports: { bus: true, taxi: true, tram: false, train: false, plane: false }
        };
      }

      console.log(`Distravel AI: Datos generados con éxito${hasGemini ? ' (usando motor Gemini Pro)' : ''}.`);
      
      // Actualizar el estado local inmediatamente
      setTempCityData(current => ({
        ...current,
        ...aiGeneratedData
      }));

      setIsAiProcessing(false);
      setIsAiEnhanced(true);
      
      Alert.alert(
        hasGemini ? "🚀 MOTOR GEMINI PRO ACTIVADO" : "✨ IA DISTRAVEL ACTIVADA",
        hasGemini 
          ? `¡Análisis Ultra-Detallado Completado para ${cityName}! La potencia de Gemini Pro ha generado un dossier completo con datos históricos profundos, análisis geográfico y recomendaciones de élite.`
          : `¡Análisis Élite Completado! Hemos generado contenido histórico, geográfico y climático avanzado para ${cityName}.`,
        [{ text: "¡EXCELENTE!", onPress: () => console.log("Usuario aceptó los datos de IA") }]
      );
    }, hasGemini ? 3500 : 2500);
  };

  const introSection = (
    <View style={styles.introSection}>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {tempCityData.description || 'Explora los lugares accesibles de este municipio.'}
      </Text>
      <TouchableOpacity onPress={() => openInfo('Descripción Completa', tempCityData.description, Info)}>
        <Text style={[styles.readMore, { color: '#E74C3C' }]}>Leer más</Text>
      </TouchableOpacity>

      {/* BOTÓN IA ELITE */}
      <TouchableOpacity 
        style={[
          styles.aiButton, 
          isAiEnhanced && styles.aiButtonActive,
          userData.aiApiKey && { backgroundColor: '#8E44AD' }
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
            ? (userData.aiApiKey ? "Gemini analizando..." : "Procesando con IA...") 
            : isAiEnhanced 
              ? (userData.aiApiKey ? "Motor Gemini Pro Activo" : "Experiencia Aumentada con IA") 
              : (userData.aiApiKey ? "Potenciar con Google Gemini" : "Aumentar experiencia con IA")}
        </Text>
        {!isAiProcessing && !isAiEnhanced && (
          <View style={[styles.aiBadge, userData.aiApiKey && { backgroundColor: '#FFF' }]}>
            <Text style={[styles.aiBadgeText, userData.aiApiKey && { color: '#8E44AD' }]}>
              {userData.aiApiKey ? "GEMINI" : "PRO"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: tempCityData.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a' }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay} />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            {/* Map Component */}
            <AutonomousCommunityMap 
              regionName={effectiveRegion} 
              cityCoords={cityCoords}
              width={140}
              height={140}
            />
            
            {/* City Name inside Hero */}
            <Text style={styles.heroCityNameInside}>
              {tempCityData.name}
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
          <MapPin color="#0A192F" size={18} />
          <Text style={styles.locationBarText}>
            {tempCityData.province || 'Alicante'} / <Text style={{ fontWeight: '800' }}>ESPAÑA</Text>
          </Text>
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

          {/* Grid Cards */}
          <View style={styles.grid}>
            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Nuestra Historia', tempCityData.history || 'Ciudad histórica.', HistoryIcon)}
              onLongPress={() => isAdmin && handleAdminEdit('Historia', tempCityData.history)}
            >
              <HistoryIcon color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Historia</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Geografía Local', tempCityData.geography || 'Ubicación estratégica.', Globe)}
              onLongPress={() => isAdmin && handleAdminEdit('Geografía', tempCityData.geography)}
            >
              <Globe color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Geografía</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Climatología', tempCityData.climate || 'Clima mediterráneo.', Cloud)}
              onLongPress={() => isAdmin && handleAdminEdit('Clima', tempCityData.climate)}
            >
              <Cloud color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Clima</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Entorno y Paisaje', tempCityData.landscape || 'Entorno privilegiado.', Mountain)}
              onLongPress={() => isAdmin && handleAdminEdit('Paisaje', tempCityData.landscape)}
            >
              <Mountain color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Paisaje</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Gastronomía', tempCityData.gastronomy || 'Gastronomía rica y variada.', Utensils)}
              onLongPress={() => isAdmin && handleAdminEdit('Gastronomía', tempCityData.gastronomy)}
            >
              <Utensils color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Gastronomía</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Festividades', tempCityData.festivities || 'Calendario festivo y cultural.', PartyPopper)}
              onLongPress={() => isAdmin && handleAdminEdit('Festividades', tempCityData.festivities)}
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
                const isActive = tempCityData.transports 
                  ? tempCityData.transports[transport.id] 
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

          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }, typography.h2]}>
              Explora Lugares
            </Text>
            {isAdmin && (
              <TouchableOpacity 
                style={[styles.adminAddBtn, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('AddLocation', { defaultCity: tempCityData.name })}
              >
                <Plus color="#FFF" size={20} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 20, paddingRight: 20 }}
          >
            {allPlaces.map((place) => {
              const savings = calculatePlaceSavings(place);
              return (
                <TouchableOpacity 
                  key={place.id} 
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
                    <Text style={styles.placeCardName} numberOfLines={2}>{place.name}</Text>
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
          </ScrollView>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>

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
    gap: 10
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
  description: { 
    fontSize: 16, 
    lineHeight: 24, 
    textAlign: 'center',
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
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  modalText: { fontSize: 17, lineHeight: 28 },
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
  }
});
