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
  Map as MapIcon, 
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
  Clock,
  CreditCard,
  Users,
  Compass
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { typography } from '../theme/typography';
import { CIUDADES_PREMIUM } from '../data/ciudades';
import { ProximityService } from '../services/ProximityService';
import { MONUMENTOS } from '../data/monumentos';

const { width } = Dimensions.get('window');

const CategoryItem = ({ icon: Icon, title, theme, color }) => (
  <TouchableOpacity style={styles.categoryCard}>
    <View style={[styles.categoryIcon, { backgroundColor: color + '15' }]}>
      <Icon color={color} size={26} />
    </View>
    <Text style={[styles.categoryText, { color: theme.textSecondary }]}>{title}</Text>
  </TouchableOpacity>
);

const CityCard = ({ city, onPress, theme, customImage }) => (
  <TouchableOpacity style={styles.cityCard} onPress={onPress}>
    <Image 
      source={{ uri: customImage || city.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a' }} 
      style={styles.cityImage} 
    />
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
    const initServices = async () => {
      try {
        console.log('HomeScreen: Iniciando servicios...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
        }

        // Delay de seguridad para el servicio de proximidad
        setTimeout(() => {
          try {
            const allPlaces = Object.values(MONUMENTOS || {}).flat();
            const userPlaces = userData?.contributions || [];
            const combinedPlaces = [...allPlaces, ...userPlaces];

            ProximityService.startWatching(combinedPlaces, (place) => {
              console.log(`Distravel v3.0: Cerca de ${place.name}`);
            });
          } catch (e) {
            console.log('Error en ProximityService:', e);
          }
        }, 3000);
      } catch (err) {
        console.log('Error en initServices:', err);
      }
    };
    initServices();
  }, []);

  const normalize = (text) => {
    if (!text) return '';
    return text.toString().trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i');
  };

  // Unificar ciudades (Premium + Usuario)
  const userCities = (userData?.contributions || []).map(p => ({
    name: p.city,
    province: p.province || p.city,
    image: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a',
    description: `Explora los lugares de ${p.city}`,
    tags: ['Comunidad']
  }));

  const uniqueCitiesMap = new Map();
  
  // 1. Añadir Ciudades Premium
  Object.values(CIUDADES_PREMIUM).forEach(city => {
    const cityKey = normalize(city.name);
    const customImage = userData?.customCityData?.[cityKey]?.image;
    
    if (city.name === 'Alicante') {
      console.log(`Distravel Debug: Alicante Key [${cityKey}], Custom Image: ${customImage ? 'SÍ' : 'NO'}`);
    }

    uniqueCitiesMap.set(cityKey, {
      ...city,
      image: customImage || city.image
    });
  });

  // 2. Añadir/Sobrescribir con Ciudades de Usuario
  (userData?.contributions || []).forEach(p => {
    if (p.city) {
      const cityKey = normalize(p.city);
      if (!uniqueCitiesMap.has(cityKey)) {
        const customImage = userData?.customCityData?.[cityKey]?.image;
        uniqueCitiesMap.set(cityKey, {
          name: p.city,
          province: p.province || p.city,
          image: customImage || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a',
          description: `Explora los lugares de ${p.city}`,
          tags: ['Comunidad']
        });
      }
    }
  });

  const allCities = Array.from(uniqueCitiesMap.values()).reverse();
  const filteredCities = searchQuery.trim() === '' 
    ? allCities 
    : allCities.filter(city => 
        normalize(city.name).includes(normalize(searchQuery)) || 
        (city.province && normalize(city.province).includes(normalize(searchQuery)))
      );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
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
                <View>
                  <Text style={styles.proBrandText}>Distravel</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>NIVEL {userData?.level || 1}</Text>
                  </View>
                </View>
             </View>
             
             <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* BOTON DE EMERGENCIA - SI NO VES ESTO, REINICIA LA APP */}
                <TouchableOpacity 
                  style={{ 
                    backgroundColor: '#FF3B30', 
                    paddingHorizontal: 12, 
                    paddingVertical: 8, 
                    borderRadius: 12, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 6,
                    borderWidth: 2,
                    borderColor: '#FFF'
                  }}
                  onPress={() => navigation.navigate('AdminValidations')}
                >
                  <ShieldCheck color="#FFF" size={18} />
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 10 }}>ADMIN</Text>
                </TouchableOpacity>

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
            <Text style={styles.proHeroSub}>Plataforma líder en turismo accesible. Encuentra destinos, monumentos y rutas validadas.</Text>
            
            <View style={styles.proHeroStats}>
              <View style={styles.proStat}>
                <Text style={styles.proStatValue}>{Math.round(userData?.totalSavings || 0)}€</Text>
                <Text style={styles.proStatLabel}>Ahorrados</Text>
              </View>
              <View style={styles.proStatDivider} />
              <View style={styles.proStat}>
                <Text style={styles.proStatValue}>{userData?.visitedPlaces?.length || 0}</Text>
                <Text style={styles.proStatLabel}>Visitados</Text>
              </View>
              <View style={styles.proStatDivider} />
              <View style={styles.proStat}>
                <Text style={styles.proStatValue}>{userData?.experience || 0}</Text>
                <Text style={styles.proStatLabel}>XP</Text>
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
          <TouchableOpacity 
            style={[styles.missionCard, { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={[styles.missionIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Sparkles color="#FFFFFF" size={24} />
            </View>
            <Text style={[styles.missionTitle, { color: '#FFFFFF' }]}>Misión del Día 🏆</Text>
            <Text style={[styles.missionDesc, { color: 'rgba(255,255,255,0.9)' }]}>Verifica la accesibilidad de un lugar cercano para ganar +200 XP.</Text>
            <View style={styles.missionXP}>
               <Text style={styles.missionXPText}>+200 XP</Text>
            </View>
          </TouchableOpacity>

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
                placeholder="Busca ciudad o monumento..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Resultados de búsqueda UNIFICADOS con IMÁGENES */}
            {searchQuery.length > 0 && (
              <View style={[styles.searchResultsDropdown, { backgroundColor: theme.surface, borderColor: theme.border, top: 60, left: 0, right: 0 }]}>
                <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
                  {/* Ciudades */}
                  {filteredCities.length > 0 && (
                    <View>
                      <Text style={[styles.dropdownSectionTitle, { color: theme.primary }]}>CIUDADES</Text>
                      {filteredCities.slice(0, 3).map((city, index) => (
                        <TouchableOpacity 
                          key={`city-${index}`} 
                          style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                          onPress={() => {
                            setSearchQuery('');
                            navigation.navigate('CityDetail', { city });
                          }}
                        >
                          <View style={styles.searchResultLeft}>
                            <Image 
                              key={userData?.customCityData?.[normalize(city.name)]?.image || city.image}
                              source={{ 
                                uri: userData?.customCityData?.[normalize(city.name)]?.image || 
                                     city.image || 
                                     'https://images.unsplash.com/photo-1543731068-7e0f5beff43a' 
                              }} 
                              style={styles.resultImageSmall} 
                            />
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

                  {/* Monumentos / Lugares */}
                  {(() => {
                    const allMonuments = Object.entries(MONUMENTOS).flatMap(([cityName, list]) => 
                      list.map(m => ({ ...m, cityName }))
                    );
                    const filteredMonuments = allMonuments.filter(m => 
                      normalize(m.name).includes(normalize(searchQuery))
                    );

                    if (filteredMonuments.length > 0) {
                      return (
                        <View>
                          <Text style={[styles.dropdownSectionTitle, { color: theme.primary }]}>LUGARES Y MONUMENTOS</Text>
                          {filteredMonuments.slice(0, 5).map((place, index) => (
                            <TouchableOpacity 
                              key={`place-${index}`} 
                              style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                              onPress={() => {
                                setSearchQuery('');
                                navigation.navigate('PlaceDetail', { place });
                              }}
                            >
                              <View style={styles.searchResultLeft}>
                                <Image 
                                  source={{ 
                                    uri: place.image || 
                                         userData?.customCityData?.[normalize(place.cityName || place.city)]?.image || 
                                         (CIUDADES_PREMIUM[place.cityName] || CIUDADES_PREMIUM[place.city])?.image 
                                  }} 
                                  style={styles.resultImageSmall} 
                                />
                                <View style={{ marginLeft: 12 }}>
                                  <Text style={[styles.searchResultName, { color: theme.text }]}>{place.name}</Text>
                                  <Text style={[styles.searchResultProvince, { color: theme.textSecondary }]}>{place.cityName}</Text>
                                </View>
                              </View>
                              <ChevronRight color={theme.textSecondary} size={16} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    }
                    return null;
                  })()}

                  {filteredCities.length === 0 && (
                    <View style={styles.noResultsContainer}>
                      <Text style={{ color: theme.textSecondary }}>No se encontraron resultados</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Disability Filter Tabs */}
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
            {[
              { id: 'MOTOR', label: 'Física', icon: Accessibility },
              { id: 'VISUAL', label: 'Visual', icon: Eye },
              { id: 'AUDITORY', label: 'Auditiva', icon: Ear },
              { id: 'COGNITIVE', label: 'Cognitiva', icon: Brain }
            ].map(type => {
              const IconComponent = type.icon;
              return (
                <TouchableOpacity 
                  key={type.id}
                  style={[
                    styles.filterTab, 
                    { backgroundColor: userData?.disabilityType === type.id ? theme.primary : theme.surface, borderColor: theme.border }
                  ]}
                  onPress={() => updateUserData({ disabilityType: type.id })}
                >
                  <IconComponent color={userData?.disabilityType === type.id ? '#FFFFFF' : theme.primary} size={16} />
                  <Text style={[styles.filterTabText, { color: userData?.disabilityType === type.id ? '#FFFFFF' : theme.text }]}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 4 }, typography.h2]}>Herramientas de Élite</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Acceso rápido a servicios críticos</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {[
              { id: 'Emergency', label: 'SOS', icon: ShieldCheck, color: '#FF3B30' },
              { id: 'DigitalWallet', label: 'Billetera', icon: Ticket, color: '#007AFF' },
              { id: 'Toilets', label: 'Baños', icon: MapPin, color: '#34C759' },
              { id: 'Report', label: 'Incidencias', icon: Star, color: '#FF9500' },
              { id: 'SavingsSimulator', label: 'Ahorro', icon: TrendingDown, color: '#5856D6' },
              { id: 'AddLocation', label: 'Añadir', icon: Plus, color: '#32ADE6' }
            ].map((tool, idx) => {
              const ToolIcon = tool.icon;
              return (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => navigation.navigate(tool.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#2C2C2E', '#1C1C1E'] : ['#FFFFFF', '#F2F2F7']}
                    style={[styles.eliteCard, { borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                  >
                    <View style={[styles.eliteIconContainer, { backgroundColor: tool.color + (isDarkMode ? '25' : '15'), borderWidth: 1, borderColor: tool.color + '30' }]}>
                      <ToolIcon color={tool.color} size={26} />
                    </View>
                    <Text style={[styles.eliteText, { color: isDarkMode ? 'rgba(255,255,255,0.9)' : '#1C1C1E' }]}>{tool.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ÚLTIMOS LUGARES DESCUBIERTOS - AHORA CON CONTRIBUCIONES REALES */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }, typography.h2]}>Últimos Descubrimientos</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {(() => {
              // Fusionar monumentos estáticos con las contribuciones del usuario (Mezcla Inteligente)
              const staticPlaces = Object.entries(MONUMENTOS).flatMap(([city, list]) => 
                list.map(m => ({ ...m, cityName: city }))
              );
              const userPlaces = (userData?.contributions || []).map(p => ({ ...p, cityName: p.city }));
              
              // Crear mapa de nombres para sobrescribir estáticos con contribuciones
              const userPlaceMap = new Map();
              userPlaces.forEach(p => userPlaceMap.set(`${p.name.toLowerCase()}-${(p.cityName || p.city).toLowerCase()}`, p));

              const merged = [...userPlaces.reverse()];
              staticPlaces.forEach(p => {
                const key = `${p.name.toLowerCase()}-${p.cityName.toLowerCase()}`;
                if (!userPlaceMap.has(key)) {
                  merged.push(p);
                }
              });

              return merged.slice(0, 6).map((place, index) => (
                <TouchableOpacity 
                  key={`recent-${index}`} 
                  style={styles.recentPlaceCard}
                  onPress={() => navigation.navigate('PlaceDetail', { place })}
                >
                  <Image 
                    source={{ uri: place.image || (CIUDADES_PREMIUM[place.cityName] || CIUDADES_PREMIUM[place.city])?.image }} 
                    style={styles.recentPlaceImage} 
                  />
                  <View style={styles.recentPlaceInfo}>
                    <Text style={[styles.recentPlaceName, { color: theme.text }]} numberOfLines={1}>{place.name}</Text>
                    <Text style={[styles.recentPlaceCity, { color: theme.textSecondary }]}>{place.cityName || place.city}</Text>
                  </View>
                </TouchableOpacity>
              ));
            })()}
          </ScrollView>
        </View>

        {/* Featured Places - EXPLORA LUGARES CON SUS FOTOS (FUSIONADO) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }, typography.h2]}>Explora Lugares Increíbles</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {(() => {
              const staticPlaces = Object.entries(MONUMENTOS).flatMap(([cityName, list]) => 
                list.map(m => ({ ...m, cityName }))
              );
              const userPlaces = (userData?.contributions || []).map(p => ({ ...p, cityName: p.city }));
              
              // Mezcla Inteligente: Priorizar versiones del usuario
              const userPlaceMap = new Map();
              userPlaces.forEach(p => userPlaceMap.set(`${p.name.toLowerCase()}-${(p.cityName || p.city).toLowerCase()}`, p));

              const merged = [...userPlaces];
              staticPlaces.forEach(p => {
                const key = `${p.name.toLowerCase()}-${p.cityName.toLowerCase()}`;
                if (!userPlaceMap.has(key)) {
                  merged.push(p);
                }
              });

              return merged.slice(0, 10).map((place, index) => (
                <TouchableOpacity 
                  key={`featured-place-${index}`} 
                  style={styles.cityCard} 
                  onPress={() => navigation.navigate('PlaceDetail', { place })}
                >
                  <Image 
                    source={{ uri: place.image || (CIUDADES_PREMIUM[place.cityName] || CIUDADES_PREMIUM[place.city])?.image }} 
                    style={styles.cityImage} 
                  />
                  <View style={styles.cityOverlay}>
                    <View style={styles.glassContainer}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cityName} numberOfLines={1}>{place.name}</Text>
                        <View style={styles.accessBadge}>
                          <MapPin color="rgba(255,255,255,0.7)" size={10} />
                          <Text style={styles.accessText}>{place.cityName || place.city}</Text>
                        </View>
                      </View>
                      <View style={styles.discountBadge}>
                        <Accessibility color="#FFD700" size={14} />
                        <Text style={styles.discountText}>{place.isUserAdded ? 'NUEVO' : 'PRO'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ));
            })()}
          </ScrollView>
        </View>

        {/* Featured Destinations */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }, typography.h2]}>Destinos por Descubrir</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
                {allCities.slice(0, 6).map((city, index) => (
                  <CityCard 
                    key={index} 
                    city={city} 
                    customImage={userData?.customCityData?.[normalize(city.name)]?.image}
                    onPress={() => navigation.navigate('CityDetail', { city })}
                    theme={theme}
                  />
                ))}</ScrollView>
        </View>

        {/* Mission-Critical Banner: Digital ID */}
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

      {/* Floating Compass Button (Fixed Position) */}
      <TouchableOpacity 
        style={[styles.floatingMapButton, { backgroundColor: isDarkMode ? 'rgba(44, 44, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}
        onPress={() => navigation.navigate('Map')}
        activeOpacity={0.8}
      >
        <Compass color={theme.primary} size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingMapButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    // Premium shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  levelBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  levelBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
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
  missionXP: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  missionXPText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
  eliteCard: {
    width: 100,
    height: 105,
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eliteIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eliteText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  eliteStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
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
  resultImageSmall: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  recentPlaceCard: {
    width: 200,
    height: 240,
    borderRadius: 24,
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  recentPlaceImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  recentPlaceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  recentPlaceName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  recentPlaceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentPlaceCity: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
