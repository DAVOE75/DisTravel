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
  ShieldCheck,
  Building2,
  MapPin,
  TrendingDown,
  Ticket,
  Bus,
  Accessibility,
  User,
  Plus
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
  const { userData } = useUser();
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

  // Filtrado inteligente: Busca por nombre, provincia o etiquetas + Pueblos de España
  const filteredCities = Object.values(CIUDADES_PREMIUM).filter(city => {
    const query = searchQuery.toLowerCase();
    return city.name.toLowerCase().includes(query) || 
           city.province.toLowerCase().includes(query) ||
           city.tags.some(tag => tag.toLowerCase().includes(query));
  });

  const matchedTowns = searchQuery.length >= 3 
    ? municipiosData.filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
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
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandContainer}>
              <Image 
                source={isDarkMode ? require('../../assets/logo_dark.png') : require('../../assets/logo_light.png')} 
                style={styles.headerLogo} 
                resizeMode="contain"
              />
              <Text style={[styles.brandText, { color: theme.primary }]}>Distravel</Text>
            </View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: theme.text }, typography.h1]}>{(userData?.name || 'Viajero').split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            {userData?.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.headerAvatar} />
            ) : (
              <User color={theme.primary} size={24} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar - AHORA FUNCIONAL */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search color={theme.textSecondary} size={20} />
            <TextInput 
              placeholder="Busca pueblos, ciudades o rutas..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Resultados de Pueblos de España */}
        {matchedTowns.length > 0 && (
          <View style={styles.townsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }, typography.h3]}>Pueblos Encontrados</Text>
            {matchedTowns.map((town, index) => (
              <TouchableOpacity 
                key={`${town.code}-${index}`}
                style={[styles.townItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setSearchQuery(town.label);
                  // Aquí se navegaría al detalle del pueblo o se filtraría el mapa
                }}
              >
                <MapPin color={theme.primary} size={18} />
                <Text style={[styles.townLabel, { color: theme.text }]}>{town.label}</Text>
                <ChevronRight color={theme.textSecondary} size={16} />
              </TouchableOpacity>
            ))}
          </View>
        )}
          
          {/* Resultados Desplegables en tiempo real */}
          {searchQuery.length > 0 && (
            <View style={[styles.searchResultsDropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {filteredCities.length > 0 ? (
                filteredCities.slice(0, 5).map((city, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                    onPress={() => {
                      setSearchQuery('');
                      navigation.navigate('CityDetail', { city });
                    }}
                  >
                    <View style={styles.searchResultLeft}>
                      <MapPin color={theme.primary} size={16} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.searchResultName, { color: theme.text }]}>{city.name}</Text>
                        <Text style={[styles.searchResultProvince, { color: theme.textSecondary }]}>{city.province}</Text>
                      </View>
                    </View>
                    <ChevronRight color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={{ color: theme.textSecondary }}>No se encontraron ciudades</Text>
                </View>
              )}
            </View>
          )}

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
        <TouchableOpacity 
          style={[styles.credentialBanner, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('DisabilityDetail')}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <ShieldCheck color="#FFFFFF" size={24} />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Acreditación Verificada</Text>
              <Text style={styles.bannerSub}>Úsala para obtener descuentos directos</Text>
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
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 15,
    zIndex: 100, // IMPORTANTE para el desplegable
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
    top: 60,
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
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
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
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
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
  townsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  townItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  townLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
