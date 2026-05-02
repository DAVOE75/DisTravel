import React, { useState } from 'react';
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
  Star, 
  History, 
  Accessibility, 
  Ticket, 
  Bus, 
  User, 
  ChevronRight,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react-native';
import { typography } from '../theme/typography';
import { CIUDADES_PREMIUM } from '../data/ciudades';

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

  const featuredCities = Object.values(CIUDADES_PREMIUM).slice(0, 6);

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
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: theme.text }, typography.h1]}>{userData.name.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <User color={theme.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Core Utility Search Section */}
        <View style={styles.searchSection}>
          <View style={[styles.searchWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search color={theme.textSecondary} size={20} />
            <TextInput
              placeholder="Busca monumentos con descuentos..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* ESSENCE CATEGORIES: Focus on Utility */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }, typography.h2]}>Filtros de Accesibilidad</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            <CategoryItem icon={Building2} title="Monumentos" theme={theme} color={theme.primary} />
            <CategoryItem icon={Ticket} title="Museos" theme={theme} color={theme.accent} />
            <CategoryItem icon={Bus} title="Transporte" theme={theme} color="#2ECC71" />
            <CategoryItem icon={Accessibility} title="Ocio" theme={theme} color="#9B59B6" />
          </ScrollView>
        </View>

        {/* Featured Destinations with emphasis on Benefits */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }, typography.h2]}>Ciudades con Ventajas</Text>
            <TouchableOpacity>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Explorar mapa</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {featuredCities.map((city, index) => (
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
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
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
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
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
});
