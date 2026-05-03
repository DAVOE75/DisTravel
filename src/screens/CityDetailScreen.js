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
  Car
} from 'lucide-react-native';
import { MONUMENTOS } from '../data/monumentos';
import { typography } from '../theme/typography';
import * as ImagePicker from 'expo-image-picker';

import * as Location from 'expo-location';
import { AutonomousCommunityMap } from '../components/AutonomousCommunityMap';
import { PROVINCE_TO_REGION } from '../data/provinces';

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

  const normalize = (text) => 
    text?.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i') || '';

  // Combinar datos oficiales con persistencia personalizada de Admin
  const cityKey = normalize(city.name);
  const customData = userData?.customCityData?.[cityKey] || {};
  
  const [tempCityData, setTempCityData] = useState({
    ...city,
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

  // Sincronizar tempCityData con userData cuando cambie
  useEffect(() => {
    if (isAdmin && Object.keys(customData).length === 0 && tempCityData.image === city.image) return;
    
    const persistChanges = async () => {
      const cityKey = normalize(tempCityData.name || city.name);
      const newCustomCityData = {
        ...userData.customCityData,
        [cityKey]: {
          image: tempCityData.image,
          history: tempCityData.history,
          climate: tempCityData.climate,
          geography: tempCityData.geography,
          landscape: tempCityData.landscape,
          lastUpdated: new Date().toISOString()
        }
      };
      await updateUserData({ customCityData: newCustomCityData });
    };
    
    // Solo persistir si hay cambios reales respecto a los datos originales o custom previos
    const hasChanges = 
      tempCityData.image !== (customData.image || city.image) ||
      tempCityData.history !== (customData.history || city.history) ||
      tempCityData.climate !== (customData.climate || city.climate) ||
      tempCityData.geography !== (customData.geography || city.geography) ||
      tempCityData.landscape !== (customData.landscape || city.landscape);

      
    if (hasChanges) {
      persistChanges();
    }
  }, [tempCityData]);

  const officialPlaces = MONUMENTOS[city.name] || [];

  const userContributions = (userData?.contributions || []).filter(p => {
    const pCity = normalize(p.city);
    const cName = normalize(city.name);
    return pCity === cName || p.name.toLowerCase().includes(cName);
  }).map(p => ({
    ...p,
    description: p.freeInfo || 'Lugar añadido por la comunidad.',
    category: p.category,
    tariffs: p.tariffs,
    isUserAdded: true,
    verified: p.verified || false,
    userId: p.userId
  }));

  // MEZCLA INTELIGENTE: Priorizar versiones del usuario (sobrescribir oficiales con el mismo nombre)
  const userPlaceMap = new Map();
  userContributions.forEach(p => userPlaceMap.set(p.name.toLowerCase(), p));

  const allPlaces = [
    ...userContributions.filter(p => isAdmin || p.verified || p.userId === userData.id),
    ...officialPlaces.filter(p => !userPlaceMap.has(p.name.toLowerCase()))
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
              'Paisaje': 'landscape'
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

  const handleAiEnhance = () => {
    setIsAiProcessing(true);
    console.log(`Distravel AI: Iniciando análisis para ${tempCityData.name}...`);
    
    // Simular procesamiento inteligente basado en el nombre de la ciudad
    setTimeout(() => {
      const cityName = tempCityData.name || city.name || 'esta ciudad';
      
      const aiGeneratedData = {
        history: `La trayectoria histórica de ${cityName} es un periplo extraordinario que abarca múltiples milenios. Desde los primeros asentamientos del Calcolítico, pasando por la hegemonía romana que dotó a la urbe de su trazado original, hasta la rica influencia andalusí que refinó su arquitectura y sistemas hídricos. Durante la Reconquista, se consolidó como una plaza fuerte de valor incalculable, siendo testigo de firmas de tratados reales y cunas de linajes que marcaron el destino de Europa. En la era moderna, su transformación industrial y su resurgimiento como polo cultural la han convertido en un museo vivo donde cada estrato arqueológico cuenta una historia de superación y esplendor artístico.`,
        geography: `${cityName} se ubica en un enclave geográfico de primer orden, asentada sobre una serie de terrazas fluviales y elevaciones que le otorgan un dominio visual absoluto sobre su entorno. Geológicamente, el terreno se compone de sustratos calizos y sedimentarios que han facilitado una arquitectura de piedra duradera. Su altitud media sobre el nivel del mar y su proximidad a accidentes geográficos clave, como valles profundos o sistemas montañosos circundantes, generan un ecosistema único. La hidrografía local, vertebrada por cursos de agua históricos, ha permitido un desarrollo agrícola y urbano sostenible que hoy se integra en una red de infraestructuras de transporte de vanguardia.`,
        climate: `El régimen climatológico de ${cityName} se define por una variante mediterránea con matices continentales, lo que se traduce en una personalidad meteorológica vibrante. Las temperaturas medias anuales oscilan de forma equilibrada, con veranos secos que registran máximas que invitan al turismo de sol y sombra, e inviernos moderados que rara vez presentan heladas severas. La pluviosidad se concentra en equinoccios, alimentando los acuíferos locales y manteniendo la frescura de sus parques. La insolación anual supera las 2.800 horas, lo que no solo define el carácter alegre de sus habitantes, sino que impulsa la eficiencia energética y la luminosidad única de sus atardeceres dorados.`,
        landscape: `El entorno paisajístico de ${cityName} es una sinfonía de biodiversidad y diseño urbano. La ciudad se funde con un cinturón verde donde predominan especies autóctonas como encinas, olivos centenarios y pinos piñoneros, creando un pulmón natural que regula la temperatura urbana. Desde sus miradores más elevados, se puede apreciar un contraste cromático fascinante entre el blanco de su casco histórico, el verde intenso de sus zonas de ribera y los tonos tierra de su campiña. La integración de rutas accesibles en este entorno permite una conexión profunda con la naturaleza sin barreras, donde el avistamiento de aves y la contemplación de horizontes infinitos se convierten en una experiencia sensorial inigualable.`
      };

      console.log('Distravel AI: Datos generados con éxito.');
      
      // Forzar la actualización del estado
      setTempCityData(current => ({
        ...current,
        ...aiGeneratedData
      }));

      setIsAiProcessing(false);
      setIsAiEnhanced(true);
      
      Alert.alert(
        "✨ IA DISTRAVEL ACTIVADA",
        `¡Análisis Élite Completado! Hemos generado contenido histórico, geográfico y climático avanzado para ${cityName}. Pulsa en los botones inferiores para descubrirlo.`,
        [{ text: "¡GENIAL!", onPress: () => console.log("Usuario aceptó los datos de IA") }]
      );
    }, 2500);
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
        style={[styles.aiButton, isAiEnhanced && styles.aiButtonActive]} 
        onPress={handleAiEnhance}
        disabled={isAiProcessing || isAiEnhanced}
      >
        {isAiProcessing ? (
          <Zap color="#FFF" size={20} />
        ) : (
          <Zap color="#FFF" size={20} fill={isAiEnhanced ? "#FFF" : "transparent"} />
        )}
        <Text style={styles.aiButtonText}>
          {isAiProcessing ? "Procesando con IA..." : isAiEnhanced ? "Experiencia Aumentada con IA" : "Aumentar experiencia con IA"}
        </Text>
        {!isAiProcessing && !isAiEnhanced && <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>PRO</Text></View>}
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
          </View>

          {isAdmin && (
            <View style={styles.adminHeaderActions}>
              <TouchableOpacity 
                style={[styles.adminActionBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                onPress={() => handleAdminEdit('Cabecera')}
              >
                <Edit color="#FFF" size={20} />
              </TouchableOpacity>
              
              {city.isUserAdded && (
                <TouchableOpacity 
                  style={[styles.adminActionBtn, { backgroundColor: 'rgba(231, 76, 60, 0.6)' }]}
                  onPress={handleDeleteContribution}
                >
                  <Trash2 color="#FFF" size={20} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={[styles.locationBar, { backgroundColor: '#FFD700' }]}>
          <MapPin color="#0A192F" size={18} />
          <Text style={styles.locationBarText}>
            {tempCityData.province || 'Alicante'} / <Text style={{ fontWeight: '800' }}>ESPAÑA</Text>
          </Text>
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
          </View>

          {/* Transporte Conectado v3.0 */}
          <View style={{ marginBottom: 35 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>
              Transporte Conectado
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <View style={[styles.transportCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                 <Bus color={theme.primary} size={24} />
                 <Text style={[styles.transportTitle, { color: theme.text }]}>Autobuses</Text>
                 <View style={styles.transportStatus}>
                    <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
                    <Text style={[styles.statusText, { color: theme.textSecondary }]}>100% Accesible</Text>
                 </View>
              </View>
              <View style={[styles.transportCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                 <Zap color="#F1C40F" size={24} />
                 <Text style={[styles.transportTitle, { color: theme.text }]}>TRAM / Metro</Text>
                 <View style={styles.transportStatus}>
                    <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
                    <Text style={[styles.statusText, { color: theme.textSecondary }]}>Rampa Auto</Text>
                 </View>
              </View>
              <View style={[styles.transportCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                 <Car color="#3498DB" size={24} />
                 <Text style={[styles.transportTitle, { color: theme.text }]}>EuroTaxi</Text>
                 <View style={styles.transportStatus}>
                    <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
                    <Text style={[styles.statusText, { color: theme.textSecondary }]}>Disponible</Text>
                 </View>
              </View>
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
            {allPlaces.map((place) => (
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
            ))}
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
    top: 40,
    left: 0, 
    right: 0, 
    bottom: 0,
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
  adminDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' },
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
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  }
});
