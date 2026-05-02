import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  Search, 
  Map, 
  Star, 
  ChevronRight,
  MapPin, 
  Filter, 
  User, 
  Sparkles,
  Accessibility,
  Info,
  TrendingDown,
  Building2,
  Ear,
  Brain,
  Ticket,
  Bus,
  Plus,
  Eye,
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { typography } from '../theme/typography';
import { CIUDADES_PREMIUM } from '../data/ciudades';
import municipiosData from '../data/municipios.json';

const { width } = Dimensions.get('window');

const CategoryItem = ({ icon: Icon, title, theme, color }) => (
  <TouchableOpacity style={styles.categoryCard}>
    <View style={[styles.categoryIcon, { backgroundColor: color + '15' }]}>
      <Icon color={color} size={26} />
    </View>
    <Text style={[styles.categoryText, { color: theme.textSecondary }]}>{title}</Text>
  </TouchableOpacity>
);

const CityCard = ({ city, onPress, theme }) => (
  <TouchableOpacity style={styles.cityCard} onPress={onPress}>
    <Image source={{ uri: city.image }} style={styles.cityImage} />
    <View style={styles.cityOverlay}>
      <View style={styles.glassContainer}>
        <View>
          <Text style={styles.cityName}>{city.name}</Text>
          <View style={styles.accessBadge}>
            <Accessibility color="#FFFFFF" size={10} />
            <Text style={styles.accessText}>Alta Accesibilidad</Text>
          </View>
        </View>
        <View style={styles.discountBadge}>
          <Ticket color="#FFD700" size={14} />
          <Text style={styles.discountText}>-50%</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export function HomeScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData } = useUser();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const normalize = (text) => 
    text?.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/y/g, 'i') || ''; // Normalizar i/y para casos como Alcoy/Alcoi

  // 3. Obtener lista única de ciudades (Premium + Contribuciones de usuarios)
  const userCities = (userData?.contributions || []).map(p => ({
    name: p.city,
    province: p.province || p.city,
    image: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a', // Placeholder
    description: `Explora los lugares de ${p.city}`,
    tags: ['Comunidad']
  }));

  // Crear un mapa para evitar duplicados por nombre de ciudad
  const uniqueCitiesMap = new Map();
  
  // Añadir ciudades premium primero (tienen prioridad en info e imágenes)
  Object.values(CIUDADES_PREMIUM).forEach(city => {
    uniqueCitiesMap.set(normalize(city.name), city);
  });

  // Añadir ciudades de usuarios si no existen ya
  userCities.forEach(city => {
    const key = normalize(city.name);
    if (!uniqueCitiesMap.has(key)) {
      uniqueCitiesMap.set(key, city);
    }
  });

  const allCitiesList = Array.from(uniqueCitiesMap.values());

  const filteredCities = allCitiesList.filter(city => {
    const query = normalize(searchQuery);
    return normalize(city.name).includes(query) || 
           (city.province && normalize(city.province).includes(query));
  });

  const PROVINCES = {
    '01': 'Álava', '02': 'Albacete', '03': 'Alicante', '04': 'Almería', '05': 'Ávila',
    '06': 'Badajoz', '07': 'Baleares', '08': 'Barcelona', '09': 'Burgos', '10': 'Cáceres',
    '11': 'Cádiz', '12': 'Castellón', '13': 'Ciudad Real', '14': 'Córdoba', '15': 'A Coruña',
    '16': 'Cuenca', '17': 'Girona', '18': 'Granada', '19': 'Guadalajara', '20': 'Guipúzcoa',
    '21': 'Huelva', '22': 'Huesca', '23': 'Jaén', '24': 'León', '25': 'Lleida',
    '26': 'La Rioja', '27': 'Lugo', '28': 'Madrid', '29': 'Málaga', '30': 'Murcia',
    '31': 'Navarra', '32': 'Ourense', '33': 'Asturias', '34': 'Palencia', '35': 'Las Palmas',
    '36': 'Pontevedra', '37': 'Salamanca', '38': 'S.C. Tenerife', '39': 'Cantabria', '40': 'Segovia',
    '41': 'Sevilla', '42': 'Soria', '43': 'Tarragona', '44': 'Teruel', '45': 'Toledo',
    '46': 'Valencia', '47': 'Valladolid', '48': 'Vizcaya', '49': 'Zamora', '50': 'Zaragoza',
    '51': 'Ceuta', '52': 'Melilla'
  };

  const getProvince = (code) => PROVINCES[code] || 'España';

  const matchedTowns = searchQuery.length >= 3 
    ? municipiosData
        .filter(m => normalize(m.label).includes(normalize(searchQuery)))
        .map(m => ({ ...m, province: getProvince(m.parent_code) }))
        .filter(m => !uniqueCitiesMap.has(normalize(m.label))) // No duplicar si ya está en Premium o Contribuciones
        .slice(0, 10)
    : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent"
        translucent={true}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PRO HERO SECTION */}
        <View style={styles.proHero}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80' }} 
            style={styles.proHeroImage} 
          />
          <View style={styles.proHeroOverlay} />

          {/* Floating Header Actions */}
          <View style={styles.proHeaderActions}>
             <View style={styles.proBrandRow}>
                <Image 
                  source={require('../../assets/logo_official.png')} 
                  style={styles.proHeroLogo} 
                />
                <Text style={styles.proBrandText}>Distravel</Text>
             </View>
             
             <View style={{ flexDirection: 'row', gap: 10 }}>
               <TouchableOpacity 
                  style={styles.proCircleBtn}
                  onPress={() => navigation.navigate('DistravelAI')}
                >
                  <Sparkles color="#FFF" size={20} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.proCircleBtn, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('Profile')}
                >
                  {userData?.profileImage ? (
                    <Image source={{ uri: userData.profileImage }} style={styles.proAvatar} />
                  ) : (
                    <User color="#FFF" size={20} />
                  )}
                </TouchableOpacity>
             </View>
          </View>
          
          <View style={styles.proHeroContent}>
            <View style={styles.proBrandBadge}>
              <Accessibility color="#FFF" size={14} />
              <Text style={styles.proBrandBadgeText}>TURISMO SIN BARRERAS</Text>
            </View>
            <Text style={styles.proHeroTitle}>Explora el mundo a tu medida</Text>
            <Text style={styles.proHeroSub}>Distravel es la plataforma líder en turismo accesible. Encuentra destinos, monumentos y rutas validadas para todas las capacidades.</Text>
            
            <View style={styles.proHeroStats}>
              <View style={styles.proStat}>
                <Text style={styles.proStatValue}>{Math.round(userData.totalSavings || 0)}€</Text>
                <Text style={styles.proStatLabel}>Ahorrados</Text>
              </View>
              <View style={styles.proStatDivider} />
              <View style={styles.proStat}>
                <Text style={styles.proStatValue}>{userData.visitedPlaces?.length || 0}</Text>
                <Text style={styles.proStatLabel}>Visitados</Text>
              </View>
              <View style={styles.proStatDivider} />
              <View style={styles.proStat}>
                <Text style={styles.proStatValue}>IA</Text>
                <Text style={styles.proStatLabel}>Asistida</Text>
              </View>
            </View>
          </View>
        </View>

        {/* MISSION CARDS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.missionScroll}
        >
          <View style={[styles.missionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.missionIcon, { backgroundColor: '#3498DB15' }]}>
              <Info color="#3498DB" size={24} />
            </View>
            <Text style={[styles.missionTitle, { color: theme.text }]}>¿Qué es Distravel?</Text>
            <Text style={[styles.missionDesc, { color: theme.textSecondary }]}>Tu guía inteligente para viajar con total confianza y accesibilidad garantizada.</Text>
          </View>

          <View style={[styles.missionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.missionIcon, { backgroundColor: '#F1C40F15' }]}>
              <TrendingDown color="#F1C40F" size={24} />
            </View>
            <Text style={[styles.missionTitle, { color: theme.text }]}>Maximiza tu Ahorro</Text>
            <Text style={[styles.missionDesc, { color: theme.textSecondary }]}>Calculamos automáticamente tus descuentos en cada monumento y museo.</Text>
          </View>

          <TouchableOpacity 
            style={[styles.missionCard, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
            onPress={() => navigation.navigate('AddLocation')}
          >
            <View style={[styles.missionIcon, { backgroundColor: theme.primary }]}>
              <Plus color="#FFF" size={24} />
            </View>
            <Text style={[styles.missionTitle, { color: theme.text }]}>¡Contribuye!</Text>
            <Text style={[styles.missionDesc, { color: theme.textSecondary }]}>Ayúdanos a crecer añadiendo nuevos lugares y validando su accesibilidad real.</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Search Bar - INTEGRADA CON EL FLOW */}
        <View style={styles.searchSection}>
          <Text style={[styles.searchLabel, { color: theme.text }]}>¿A dónde quieres ir hoy?</Text>
          
          {/* Contenedor relativo para anclar el dropdown */}
          <View style={{ position: 'relative', zIndex: 9999 }}>
            <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Search color={theme.textSecondary} size={20} />
              <TextInput 
                placeholder="Busca una ciudad..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Resultados de búsqueda UNIFICADOS (Ahora pegados al buscador) */}
            {searchQuery.length > 0 && (
              <View style={[styles.searchResultsDropdown, { backgroundColor: theme.surface, borderColor: theme.border, top: 60, left: 0, right: 0 }]}>
                <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
                  {/* Sección de Ciudades Premium / Propias */}
                  {filteredCities.length > 0 && (
                    <View>
                      <Text style={[styles.dropdownSectionTitle, { color: theme.primary }]}>CIUDADES DESTACADAS</Text>
                      {filteredCities.map((city, index) => (
                        <TouchableOpacity 
                          key={`city-${index}`} 
                          style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                          onPress={() => {
                            setSearchQuery('');
                            navigation.navigate('CityDetail', { city });
                          }}
                        >
                          <View style={styles.searchResultLeft}>
                            <View style={[styles.resultIcon, { backgroundColor: theme.primary + '15' }]}>
                              <Building2 color={theme.primary} size={16} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                              <Text style={[styles.searchResultName, { color: theme.text }]}>{city.name}</Text>
                              <Text style={[styles.searchResultProvince, { color: theme.textSecondary }]}>{city.province}</Text>
                            </View>
                          </View>
                          <ChevronRight color={theme.textSecondary} size={16} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Sección de Pueblos (Base de datos general) */}
                  {matchedTowns.length > 0 && (
                    <View>
                      <Text style={[styles.dropdownSectionTitle, { color: theme.textSecondary, marginTop: 10 }]}>PUEBLOS Y MUNICIPIOS</Text>
                      {matchedTowns.map((town, index) => (
                        <TouchableOpacity 
                          key={`town-${index}`}
                          style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                          onPress={() => {
                            setSearchQuery('');
                            navigation.navigate('CityDetail', { 
                              city: { 
                                name: town.label, 
                                province: town.province || 'España',
                                image: 'https://images.unsplash.com/photo-1544281679-5357151b483c?auto=format&fit=crop&w=800&q=80',
                                description: 'Explora los lugares accesibles de este municipio.',
                                history: 'Información histórica en proceso de verificación.',
                                tags: ['Pueblo']
                              } 
                            });
                          }}
                        >
                          <View style={styles.searchResultLeft}>
                            <View style={[styles.resultIcon, { backgroundColor: theme.textSecondary + '15' }]}>
                              <MapPin color={theme.textSecondary} size={16} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                              <Text style={[styles.searchResultName, { color: theme.text }]}>{town.label}</Text>
                              <Text style={[styles.searchResultProvince, { color: theme.textSecondary }]}>{town.province || 'España'}</Text>
                            </View>
                          </View>
                          <ChevronRight color={theme.textSecondary} size={16} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {filteredCities.length === 0 && matchedTowns.length === 0 && (
                    <View style={styles.noResultsContainer}>
                      <Text style={{ color: theme.textSecondary }}>No se encontraron resultados</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Disability Filter Tabs (Restaurados tras la sección de búsqueda) */}
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
            {[
              { id: 'MOTOR', label: 'Física', icon: Accessibility },
              { id: 'VISUAL', label: 'Visual', icon: Eye },
              { id: 'AUDITORY', label: 'Auditiva', icon: Ear },
              { id: 'COGNITIVE', label: 'Cognitiva', icon: Brain }
            ].map(type => (
              <TouchableOpacity 
                key={type.id}
                style={[
                  styles.filterTab, 
                  { backgroundColor: userData.disabilityType === type.id ? theme.primary : theme.surface, borderColor: theme.border }
                ]}
                onPress={() => updateUserData({ disabilityType: type.id })}
              >
                <type.icon color={userData.disabilityType === type.id ? '#FFFFFF' : theme.primary} size={16} />
                <Text style={[styles.filterTabText, { color: userData.disabilityType === type.id ? '#FFFFFF' : theme.text }]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }, typography.h2]}>Herramientas de Élite 🌟</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('Emergency')}>
              <View style={[styles.toolIcon, { backgroundColor: '#E74C3C15' }]}>
                <ShieldCheck color="#E74C3C" size={28} />
              </View>
              <Text style={[styles.toolText, { color: theme.text }]}>SOS Emergencia</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('DisabilityDetail')}>
              <View style={[styles.toolIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ticket color={theme.primary} size={28} />
              </View>
              <Text style={[styles.toolText, { color: theme.text }]}>Mi Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('Toilets')}>
              <View style={[styles.toolIcon, { backgroundColor: '#2ECC7115' }]}>
                <MapPin color="#2ECC71" size={28} />
              </View>
              <Text style={[styles.toolText, { color: theme.text }]}>Baños Adaptados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('Report')}>
              <View style={[styles.toolIcon, { backgroundColor: '#F1C40F15' }]}>
                <Star color="#F1C40F" size={28} />
              </View>
              <Text style={[styles.toolText, { color: theme.text }]}>Reportar Fallo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('SavingsSimulator')}>
              <View style={[styles.toolIcon, { backgroundColor: '#9B59B615' }]}>
                <TrendingDown color="#9B59B6" size={28} />
              </View>
              <Text style={[styles.toolText, { color: theme.text }]}>Simulador Ahorro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('AddLocation')}>
              <View style={[styles.toolIcon, { backgroundColor: '#3498DB15' }]}>
                <Plus color="#3498DB" size={28} />
              </View>
              <Text style={[styles.toolText, { color: theme.text }]}>Añadir Lugar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>



        {/* Featured Destinations with emphasis on Benefits */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }, typography.h2]}>Explora tu Próximo Destino</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Mapa Completo</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {filteredCities.map((city, index) => (
              <CityCard 
                key={index} 
                city={city} 
                theme={theme}
                onPress={() => navigation.navigate('CityDetail', { city })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Mission-Critical Banner: Digital ID */}
        {/* Explore Features - TOP 10 STRATEGY */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>HERRAMIENTAS ELITE</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.featuresScroll}
        >
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('SavingsSimulator')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#F1C40F15' }]}>
              <TrendingDown color="#F1C40F" size={20} />
            </View>
            <Text style={[styles.featureName, { color: theme.text }]}>Simulador Ahorro</Text>
            <Text style={[styles.featureStatus, { color: theme.success }]}>ACTIVO</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('DigitalWallet')}
          >
            <View style={[styles.featureIcon, { backgroundColor: theme.primary + '15' }]}>
              <CreditCard color={theme.primary} size={20} />
            </View>
            <Text style={[styles.featureName, { color: theme.text }]}>Billetera EU</Text>
            <Text style={[styles.featureStatus, { color: theme.success }]}>ACTIVO</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('DistravelAI')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#9B59B615' }]}>
              <Sparkles color="#9B59B6" size={20} />
            </View>
            <Text style={[styles.featureName, { color: theme.text }]}>Explorar IA</Text>
            <Text style={[styles.featureStatus, { color: theme.success }]}>ACTIVO</Text>
          </TouchableOpacity>

          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: 0.6 }]}>
            <View style={[styles.featureIcon, { backgroundColor: theme.textSecondary + '15' }]}>
              <Users color={theme.textSecondary} size={20} />
            </View>
            <Text style={[styles.featureName, { color: theme.text }]}>Comunidad</Text>
            <Text style={[styles.featureStatus, { color: theme.textSecondary }]}>PRÓXIMAMENTE</Text>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.credentialBanner, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('DigitalWallet')}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <CreditCard color="#FFFFFF" size={24} />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Billetera Digital Activa</Text>
              <Text style={styles.bannerSub}>Acceso rápido a tu tarjeta europea</Text>
            </View>
          </View>
          <ChevronRight color="#FFFFFF" size={24} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  proHeaderActions: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  proBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proHeroLogo: {
    width: 28,
    height: 28,
  },
  proBrandText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  proCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  proHero: {
    height: 400,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  proHeroImage: {
    width: '100%',
    height: '100%',
  },
  proHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  proHeroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  proBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proBrandBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 1,
  },
  proHeroTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 12,
    lineHeight: 40,
  },
  proHeroSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  proHeroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proStat: {
    alignItems: 'center',
  },
  proStatValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  proStatLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  proStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 25,
  },
  missionScroll: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 5,
  },
  missionCard: {
    width: 220,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 15,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  missionDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  searchLabel: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
    zIndex: 100, 
    position: 'relative', // Para posicionar el dropdown correctamente
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 90, // Ajustado para quedar bajo la barra (Label + Margin + Bar)
    left: 20,
    right: 20,
    borderRadius: 15,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
  },
  searchResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '700',
  },
  searchResultProvince: {
    fontSize: 12,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterTabsContainer: {
    marginTop: 15,
  },
  filterTabs: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 18,
    fontWeight: '800',
  },
  categoriesList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 25,
  },
  categoryIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toolCard: {
    alignItems: 'center',
    marginRight: 25,
    width: 85,
  },
  toolIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  toolText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  featuredList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  cityCard: {
    width: width * 0.75,
    height: 400,
    marginRight: 20,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  cityImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  cityOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  glassContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 16,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cityName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accessText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  discountText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 4,
  },
  credentialBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featuresScroll: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 5,
  },
  featureCard: {
    width: 140,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureStatus: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    marginLeft: 15,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  dropdownSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
