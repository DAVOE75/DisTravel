import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { 
  MapPin, 
  Search, 
  Accessibility, 
  Star,
  Clock,
  Compass, 
  ChevronRight, 
  TrendingDown,
  Zap,
  ShieldCheck,
  CreditCard,
  X,
  Palmtree,
  Castle,
  Coffee,
  Waves,
  Users,
  PlusCircle,
  AlertTriangle,
  Sparkles,
  Info,
  Map as MapIcon,
  MessageSquare,
  Church
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { MONUMENTOS } from '../data/monumentos';
import { CIUDADES_PREMIUM } from '../data/ciudades';
import { calculatePlaceSavings } from '../utils/savings';
import { getOpeningStatus } from '../utils/timeUtils';
import { typography } from '../theme/typography';
import MUNICIPIOS_DATA from '../data/municipios.json';
import { INE_PROVINCES, PROVINCE_TO_REGION } from '../data/provinces';
import { getFiestaPatronal } from '../data/fiestasPatronales';
import { getPoblacion } from '../data/poblacion';

import { API_ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');

// Fallback local en caso de que el servidor no responda
const LOCAL_FALLBACK_MUNICIPIOS = MUNICIPIOS_DATA.map(m => {
  const provinceName = INE_PROVINCES[m.parent_code] || 'Desconocida';
  const regionName = PROVINCE_TO_REGION[provinceName] || 'España';
  const premiumData = CIUDADES_PREMIUM[m.label];
  return { ...m, name: m.label, province: provinceName, region: regionName, isCity: true, ...(premiumData || {}) };
});
const CATEGORIES = [
  { id: '1', name: 'Playas', icon: Waves, color: '#3498DB' },
  { id: '2', name: 'Castillos', icon: Castle, color: '#E67E22' },
  { id: '3', name: 'Ocio', icon: Coffee, color: '#9B59B6' },
  { id: '4', name: 'Cultura', icon: Star, color: '#F1C40F' },
  { id: '5', name: 'Iglesias', icon: Church, color: '#2ECC71' },
];

export function HomeScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData } = useUser();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [serverPlaces, setServerPlaces] = useState([]);
  const searchTimeout = useRef(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Efecto para buscar en el servidor con debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`${API_ENDPOINTS.MUNICIPALITIES}?search=${encodeURIComponent(searchQuery)}&limit=10`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          // Mapear datos del servidor al formato esperado por la UI
          const mappedData = data.map(m => {
            const provinceName = INE_PROVINCES[m.parent_code] || 'Desconocida';
            const regionName = PROVINCE_TO_REGION[provinceName] || 'España';
            return {
              ...m,
              name: m.name,
              province: provinceName,
              region: regionName,
              isCity: true
            };
          });
          setSearchResults(mappedData);
        } else {
          // Fallback local si el servidor falla
          performLocalSearch();
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error buscando en servidor:', error);
        }
        performLocalSearch();
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Efecto para cargar lugares destacados del servidor
  useEffect(() => {
    const fetchServerPlaces = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(API_ENDPOINTS.PLACES, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // Mapear para compatibilidad: los monumentos oficiales ahora vienen con extra_data
          const mapped = data.map(p => ({
            ...p,
            ...p.extra_data,
            cityName: p.city // Compatibilidad con el resto del código
          }));
          setServerPlaces(mapped);
        } else {
          const flatMonumentos = Object.values(MONUMENTOS).flat();
          setServerPlaces(flatMonumentos.slice(0, 10));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error cargando lugares del servidor:', error);
        }
        const flatMonumentos = Object.values(MONUMENTOS).flat();
        setServerPlaces(flatMonumentos.slice(0, 10));
      }
    };

    fetchServerPlaces();
  }, []);

  const performLocalSearch = () => {
    const normQuery = normalize(searchQuery);
    if (!normQuery) return;

    const filtered = LOCAL_FALLBACK_MUNICIPIOS
      .filter(m => normalize(m.name).includes(normQuery))
      .sort((a, b) => {
        const aNorm = normalize(a.name);
        const bNorm = normalize(b.name);
        
        // Exact match first
        if (aNorm === normQuery) return -1;
        if (bNorm === normQuery) return 1;
        
        // Starts with match second
        const aStarts = aNorm.startsWith(normQuery);
        const bStarts = bNorm.startsWith(normQuery);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
        
        // Alphabetical otherwise
        return aNorm.localeCompare(bNorm);
      })
      .slice(0, 15);
      
    setSearchResults(filtered);
  };

  
  const isAdmin = userData?.isAdmin || userData?.role === 'admin';
  
  const normalize = (text) => {
    if (!text) return '';
    return text.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i');
  };
  

  const mergedPlaces = useMemo(() => {
    const staticPlaces = Object.entries(MONUMENTOS).flatMap(([cityName, list]) => 
      list.map(m => ({ ...m, cityName, isPlace: true }))
    );
    const userPlaces = (userData?.contributions || []).map(c => ({ 
      ...c, 
      isPlace: true, 
      cityName: c.city || c.cityName 
    }));

    const map = new Map();
    // Prioridad y orden: Los últimos añadidos o modificados primero
    staticPlaces.forEach(p => map.set(p.id || p.name, p));
    userPlaces.forEach(p => map.set(p.id || p.name, p));
    serverPlaces.forEach(p => map.set(p.id || p.name, p));

    // Convertimos a array y ordenamos: User Added y IDs más altos primero
    return Array.from(map.values()).sort((a, b) => {
      if (a.isUserAdded && !b.isUserAdded) return -1;
      if (!a.isUserAdded && b.isUserAdded) return 1;
      return String(b.id).localeCompare(String(a.id));
    });
  }, [userData?.contributions, serverPlaces]);

  const searchData = LOCAL_FALLBACK_MUNICIPIOS;

  const goToProfile = () => navigation.navigate('Profile');
  const goToIA = () => navigation.navigate('DistravelAI');
  const goToAdmin = () => navigation.navigate('AdminValidations');
  const goToMap = () => navigation.navigate('Map');

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

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* About Distravel Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: '#3498DB20' }]}>
              <Info color="#3498DB" size={32} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Qué es Distravel?</Text>
            <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
              Distravel es una plataforma diseñada para ayudar a las personas con discapacidad a descubrir que tienen derecho a importantes descuentos y beneficios en entradas utilizando su tarjeta de discapacidad.{"\n\n"}
              Somos una base de datos de lugares turísticos donde podrás conocer todos los beneficios que te corresponden en cada destino para que viajar sea más accesible y económico por disponer de tu tarjeta de discapacidad.
            </Text>
            <TouchableOpacity 
              style={[styles.modalCloseBtn, { backgroundColor: theme.primary }]}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ref={scrollViewRef}
      >
        {/* Header Layer (Profile, AI, Admin) */}
        <View style={styles.topActionsRow}>
          <View style={styles.topActionsLeft}>
            {/* Logo removed here as it is now in the Greeting Box */}
          </View>
          <View style={styles.topActionsRight}>
            <TouchableOpacity onPress={goToProfile} style={styles.profileBtn}>
              <Image 
                source={{ uri: userData?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }} 
                style={styles.fullImage} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={goToIA} style={[styles.actionBtn, { backgroundColor: '#6366f1' }]}>
              <Zap color="#FFF" size={20} fill="#FFF" />
            </TouchableOpacity>
            
            {isAdmin && (userData?.contributions || []).filter(p => !p.verified && p.id !== 'castillo-belmonte' && p.id !== 'castillo-la-mota' && p.id !== 'castillo-santa-barbara').length > 0 && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('AdminValidations')} 
                style={[styles.actionBtn, { backgroundColor: '#EFBF04' }]}
              >
                <ShieldCheck color="#0A192F" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Header Section with Background */}
        <View style={[styles.headerHero, { height: 350 }]}>
          <Image 
            source={require('../../assets/hero_bg.png')} 
            style={styles.heroBg}
            blurRadius={1.5}
          />
          <View style={[styles.heroOverlay, { backgroundColor: 'rgba(7, 11, 20, 0.5)' }]} />
          
          <View style={styles.heroContentMain}>
            <View style={styles.heroGreetingBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Image 
                  source={require('../../assets/logo_dark.png')} 
                  style={styles.heroLogo} 
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.heroBrandText}>Distravel</Text>
                  <Text style={styles.heroGreeting}>Hola, {userData?.name || 'Viajero'}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.heroTitle, { 
              color: '#FFF',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4
            }]}>Ahorra con tu tarjeta de discapacidad</Text>
            <Text style={[styles.heroSub, { color: 'rgba(255,255,255,0.8)' }]}>
              Aprovéchala en tus viajes con la guía definitiva para el turismo accesible y beneficios exclusivos.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(userData?.totalSavings || 0)}€</Text>
                <Text style={styles.statLabel}>AHORROS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData?.visitedPlaces?.length || 0}</Text>
                <Text style={styles.statLabel}>VISITAS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData?.experience || 0}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mission Cards Section */}
        <View style={[styles.missionCardsContainer, { marginTop: 10 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.missionListPadding}>
            <TouchableOpacity 
              onPress={goToMap}
              style={[
                styles.missionCard, 
                { 
                  backgroundColor: '#F1C40F', 
                  width: 160, 
                  height: 160,
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 3,
                  shadowOpacity: 0.03,
                  elevation: 1
                }
              ]}
            >
              <View style={styles.missionIconBox}>
                <Sparkles color="#070B14" size={24} />
              </View>
              <View style={[styles.xpBadge, { top: 10, right: 10 }]}>
                <Text style={[styles.xpBadgeText, { fontSize: 10 }]}>+200 XP</Text>
              </View>
              <Text style={[styles.missionTitle, { color: '#070B14', fontSize: 15, marginTop: 4 }]}>Misión del Día</Text>
              <Text style={[styles.missionDesc, { color: '#070B14', fontSize: 11, lineHeight: 14 }]}>
                Verifica la accesibilidad y gana puntos.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowAboutModal(true)}
              style={[
                styles.missionCard, 
                { 
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', 
                  borderWidth: 1, 
                  borderColor: theme.border, 
                  width: 160, 
                  height: 160,
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 3,
                  shadowOpacity: 0.03,
                  elevation: 1
                }
              ]}
            >
              <View style={[styles.missionIconBox, { backgroundColor: '#3498DB20' }]}>
                <Info color="#3498DB" size={24} />
              </View>
              <Text style={[styles.missionTitle, { color: theme.text, fontSize: 15, marginTop: 4 }]}>¿Qué es Distravel?</Text>
              <Text style={[styles.missionDesc, { color: theme.textSecondary, fontSize: 11, lineHeight: 14 }]}>
                Tu guía inteligente para viajar con confianza.
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <Text style={[styles.searchTitle, { color: theme.textSecondary, fontSize: 18 }]}>¿A dónde quieres ir hoy?</Text>
        </View>

        {/* Search Section (Ahora integrado en el flujo) */}
        <View style={[styles.searchOuter, { paddingHorizontal: 20, marginTop: 10 }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search color={theme.textSecondary} size={20} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar ciudades..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onFocus={() => {
                // Scroll specifically to the search bar section
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 600, animated: true });
                }, 100);
              }}
              onChangeText={(text) => {
                setSearchQuery(text);
                const hasResults = text.length > 1;
                setShowSearchResults(hasResults);
                if (hasResults) {
                  // Scroll to position the search bar at the very top
                  scrollViewRef.current?.scrollTo({ y: 620, animated: true });
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSearchResults(false); }}>
                <X color={theme.textSecondary} size={18} />
              </TouchableOpacity>
            )}
          </View>

          {showSearchResults && (
            <View style={[styles.searchResults, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: isDarkMode ? '#000' : '#475569' }]}>
              {isSearching ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator color={theme.accent} />
                  <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>Buscando en Distravel...</Text>
                </View>
              ) : searchResults.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 14 }}>No se encontraron municipios</Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
                  {searchResults.map((item, idx, arr) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.searchItem, 
                        { borderBottomColor: theme.border, borderBottomWidth: idx === arr.length - 1 ? 0 : 0.5 }
                      ]}
                      onPress={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                        navigation.navigate('CityDetail', { city: item });
                      }}
                    >
                      <View style={[styles.searchIconCircle, { backgroundColor: '#3498DB20' }]}>
                        <MapPin color="#3498DB" size={18} />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Text style={[styles.itemCity, { color: theme.textSecondary }]}>
                            {item.province}, {item.region}
                          </Text>
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                          <View style={styles.searchFiestaBadge}>
                            <Text style={styles.searchFiestaText}>
                              🎊 {item.fiesta || 'Festa Local'}
                            </Text>
                          </View>
                          <View style={[styles.searchFiestaBadge, { backgroundColor: '#3498DB15' }]}>
                            <Text style={[styles.searchFiestaText, { color: '#3498DB' }]}>
                              👥 {item.population?.toLocaleString() || item.habitantes || 'Censo 2023'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Servicios de Asistencia (Quick Actions) */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            <TouchableOpacity 
              style={[styles.serviceCard, { backgroundColor: '#FF3B30' }]} 
              onPress={() => navigation.navigate('Emergency')}
            >
              <AlertTriangle color="#FFF" size={24} />
              <Text style={styles.serviceText}>SOS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, { backgroundColor: '#3498DB' }]} 
              onPress={() => navigation.navigate('Toilets')}
            >
              <Users color="#FFF" size={24} />
              <Text style={styles.serviceText}>BAÑOS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, { backgroundColor: '#F1C40F' }]} 
              onPress={() => navigation.navigate('Report')}
            >
              <ShieldCheck color="#070B14" size={24} />
              <Text style={[styles.serviceText, { color: '#070B14' }]}>REPORTAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.serviceCard, 
                { 
                  backgroundColor: isDarkMode ? '#000' : theme.primary,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: isDarkMode ? '#444' : 'transparent'
                }
              ]} 
              onPress={() => navigation.navigate('Map')}
            >
              <Compass color="#FFF" size={24} />
              <Text style={styles.serviceText}>MAPA</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Elite/Verificados Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Verificados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Social')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700', marginRight: 4 }}>Ver Comunidad</Text>
              <Users color={theme.primary} size={14} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            {mergedPlaces.filter(p => p.verified || p.verifiedStatus === 'Verificado' || p.verifiedByCommunity?.status === 'Alta Confianza').slice(0, 10).map((place, idx) => {
              const savings = calculatePlaceSavings(place);
              const status = getOpeningStatus(place);
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.recentCard, { backgroundColor: theme.surface }]} 
                  onPress={() => navigation.navigate('PlaceDetail', { place })}
                >
                  <Image source={{ uri: place.image }} style={styles.recentImage} />
                  <View style={styles.recentInfo}>
                    <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{place.name}</Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} color="#F1C40F" fill="#F1C40F" />
                      ))}
                      <Text style={{ fontSize: 10, color: theme.textSecondary, marginLeft: 4, fontWeight: '700' }}>5.0</Text>
                    </View>

                    <View style={styles.placeMeta}>
                      <Text style={[styles.placeCity, { color: theme.textSecondary }]}>{place.city || place.cityName}</Text>
                      {savings > 0 && (
                        <View style={styles.savingsBadge}>
                          <TrendingDown color="#2ECC71" size={12} />
                          <Text style={styles.savingsText}>-{savings}€</Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Clock size={12} color={status.color} />
                      <Text style={{ fontSize: 11, color: status.color, fontWeight: '700', marginLeft: 4 }}>
                        {status.text}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.eliteStatusDot, { 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    backgroundColor: status.color, 
                    width: 12, 
                    height: 12, 
                    borderRadius: 6,
                    borderWidth: 2, 
                    borderColor: theme.surface 
                  }]} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryCard}
                onPress={() => navigation.navigate('CategoryList', { category: cat })}
              >
                <View style={[styles.categoryIcon, { backgroundColor: theme.surface, borderColor: cat.color + '40' }]}>
                  <View style={[styles.categoryGlow, { backgroundColor: cat.color }]} />
                  <cat.icon color={cat.color} size={28} strokeWidth={2.5} />
                </View>
                <Text style={[styles.categoryText, { color: theme.textSecondary }]}>{cat.name.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Discoveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Descubrimientos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Ver Mapa</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            {mergedPlaces.slice(0, 10).map((place, index) => {
              const savings = calculatePlaceSavings(place);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.recentCard, { backgroundColor: theme.surface }]}
                  onPress={() => navigation.navigate('PlaceDetail', { place })}
                >
                  <Image 
                    source={{ uri: place.image || 'https://images.unsplash.com/photo-1548013146-72479768b921?auto=format&fit=crop&q=80&w=400' }} 
                    style={styles.recentImage}
                    defaultSource={{ uri: 'https://images.unsplash.com/photo-1548013146-72479768b921?auto=format&fit=crop&q=80&w=400' }}
                  />
                  <View style={styles.recentInfo}>
                    <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{place.name}</Text>
                    <View style={styles.placeMeta}>
                      <Text style={[styles.placeCity, { color: theme.textSecondary }]}>{place.cityName}</Text>
                      {savings > 0 && (
                        <View style={styles.savingsBadge}>
                          <TrendingDown color="#2ECC71" size={12} />
                          <Text style={styles.savingsText}>-{savings}€</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} color="#F1C40F" fill={s <= (place.rating || 5) ? "#F1C40F" : "transparent"} />
                      ))}
                      <Text style={{ fontSize: 10, color: theme.textSecondary, marginLeft: 4, fontWeight: '700' }}>{place.rating ? place.rating.toFixed(1) : '5.0'}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {(() => {
                        const status = getOpeningStatus(place);
                        return (
                          <>
                            <Clock size={10} color={status.color} />
                            <Text style={{ fontSize: 10, color: status.color, fontWeight: '700', marginLeft: 4 }}>
                              {status.text}
                            </Text>
                          </>
                        );
                      })()}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Premium Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Destinos Destacados</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            {Object.entries(CIUDADES_PREMIUM).map(([name, city], index) => {
              const cityKey = normalize(name);
              const customData = userData?.customCityData?.[cityKey] || {};
              const displayImage = customData.image || city.image;
              const displayCity = { ...city, name, image: displayImage };
              
              return (
                <TouchableOpacity 
                  key={index}
                  style={[styles.featuredCityCard, { backgroundColor: theme.surface }]}
                  onPress={() => navigation.navigate('CityDetail', { city: displayCity })}
                >
                  <Image source={{ uri: displayImage }} style={styles.featuredCityImage} />
                  <View style={styles.featuredCityOverlay}>
                    <View style={styles.glassContainer}>
                      <View>
                        <Text style={styles.cityName}>{name}</Text>
                        <View style={styles.accessBadge}>
                          <Accessibility color="#2ECC71" size={12} />
                          <Text style={styles.accessText}>ACCESIBLE</Text>
                        </View>
                      </View>
                      <ChevronRight color="#FFF" size={20} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Digital ID Banner */}
        <TouchableOpacity
          style={[styles.banner, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('DigitalWallet')}
        >
          <View style={styles.bannerRow}>
            <View style={styles.bannerIcon}>
              <CreditCard color="#FFF" size={24} />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.bannerTitle}>Billetera Digital</Text>
              <Text style={styles.bannerSub}>Acceso rápido a tu tarjeta PCD</Text>
            </View>
          </View>
          <ChevronRight color="#FFF" size={24} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Expandable FAB Menu */}
      <View style={styles.fabContainer}>
        {isMenuOpen && (
          <Animated.View style={[styles.expandedMenu, { opacity: menuOpacity, transform: [{ scale: menuScale }] }]}>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: '#FF3B30' }]} 
              onPress={() => { toggleMenu(); navigation.navigate('Emergency'); }}
            >
              <AlertTriangle color="#FFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: '#3498DB' }]} 
              onPress={() => { toggleMenu(); navigation.navigate('Toilets'); }}
            >
              <Users color="#FFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.miniFab, { backgroundColor: theme.primary }]} 
              onPress={() => { toggleMenu(); navigation.navigate('Map'); }}
            >
              <MapPin color="#FFF" size={20} />
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  adminBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  adminBarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerHero: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    height: 350,
  },
  heroBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  topActionsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  topActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topActionsRight: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoSmall: {
    width: 35,
    height: 35,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  heroGreetingBox: {
    marginBottom: 20,
  },
  heroGreeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  heroBrandText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 15,
  },
  missionCardsContainer: {
    zIndex: 10,
  },
  missionCard: {
    width: 160,
    borderRadius: 16,
    padding: 15,
    marginRight: 12,
    height: 160,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 15,
  },
  heroContentMain: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  heroLogo: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  missionCardsContainer: {
    marginTop: -40,
    zIndex: 10,
  },
  missionListPadding: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  // Removed duplicate missionCard
  missionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  xpBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  xpBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  missionDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 15,
  },
  searchOuter: {
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  searchResults: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 4000,
    overflow: 'hidden',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
  },
  searchIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: { fontWeight: '700', fontSize: 15 },
  itemCity: { fontSize: 12, fontWeight: '500' },
  searchFiestaBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  searchFiestaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AC0D',
  },
  searchResults: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 5000,
    overflow: 'hidden',
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  section: { marginBottom: 35, marginTop: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  listPadding: { paddingLeft: 20, paddingRight: 10 },
  categoryCard: {
    alignItems: 'center',
    marginRight: 22,
    width: 75,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  serviceCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  serviceText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  recentCard: {
    width: 240,
    height: 290,
    borderRadius: 28,
    marginRight: 18,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 15,
  },
  recentImage: { 
    width: '100%', 
    height: 170, 
    backgroundColor: '#E2E8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  recentInfo: { padding: 18 },
  placeName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  placeMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placeCity: { fontSize: 12, fontWeight: '600' },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  savingsText: { color: '#2ECC71', fontSize: 11, fontWeight: '900' },
  featuredCityCard: {
    width: width * 0.78,
    height: 400,
    marginRight: 20,
    borderRadius: 36,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  featuredCityImage: { width: '100%', height: '100%' },
  featuredCityOverlay: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
  },
  glassContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cityName: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  accessBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  accessText: { color: '#2ECC71', fontSize: 11, fontWeight: '900', marginLeft: 4 },
  banner: {
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  bannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  bannerSub: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 14, marginTop: 4 },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
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
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalCloseBtn: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
