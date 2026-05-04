import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { 
  ChevronLeft, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  TrendingDown,
  ArrowRight,
  Filter,
  X
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { MONUMENTOS } from '../data/monumentos';
import { calculatePlaceSavings } from '../utils/savings';
import { getOpeningStatus } from '../utils/timeUtils';

export default function CategoryListScreen({ route, navigation }) {
  const { category } = route.params;
  const { theme, isDarkMode } = useTheme();
  const { userData } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Merge all places from MONUMENTOS and user contributions
  const allPlaces = useMemo(() => {
    let merged = [];
    
    // 1. Static Monuments
    Object.keys(MONUMENTOS).forEach(city => {
      MONUMENTOS[city].forEach(place => {
        merged.push({ ...place, cityName: city });
      });
    });

    // 2. User Contributions (Discoveries)
    const userPlaces = (userData?.contributions || []).map(c => ({ 
      ...c, 
      isPlace: true, 
      cityName: c.city || c.cityName 
    }));
    
    merged = [...merged, ...userPlaces];
    
    // Filter by category logic
    return merged.filter(place => {
      const name = (place.name || '').toLowerCase();
      const cat = (place.category || '').toLowerCase();
      
      switch(category.name.toLowerCase()) {
        case 'playas':
          return cat.includes('playa') || name.includes('playa') || name.includes('cala');
        case 'castillos':
          return name.includes('castillo') || name.includes('alcazar') || name.includes('fortaleza') || name.includes('muralla') || cat.includes('castillo');
        case 'ocio':
          return cat.includes('ocio') || cat.includes('deporte') || cat.includes('parque') || name.includes('estadio') || cat.includes('restaurante');
        case 'cultura':
          return cat.includes('museo') || cat.includes('teatro') || cat.includes('cultura') || cat.includes('monumento') || cat.includes('arte');
        case 'iglesias':
          return name.includes('iglesia') || name.includes('catedral') || name.includes('basilica') || name.includes('ermita') || name.includes('convento') || name.includes('parroquia') || cat.includes('iglesia') || cat.includes('religion');
        default:
          return true;
      }
    });
  }, [category, userData?.contributions]);

  const filteredPlaces = allPlaces.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.cityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlaceItem = ({ item }) => {
    const savings = calculatePlaceSavings(item);
    const status = getOpeningStatus(item);

    return (
      <TouchableOpacity 
        style={[styles.placeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => navigation.navigate('PlaceDetail', { place: item })}
      >
        <Image source={{ uri: item.image }} style={styles.placeImage} />
        
        <View style={styles.placeInfo}>
          <View style={styles.cardHeader}>
            <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          </View>
          
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>{item.cityName}</Text>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} color="#F1C40F" fill="#F1C40F" />)}
            </View>
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>5.0</Text>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.statusRow}>
              <Clock size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
            </View>
            
            {savings > 0 && (
              <View style={[styles.savingsBadge, { backgroundColor: '#2ECC7120' }]}>
                <TrendingDown color="#2ECC71" size={12} />
                <Text style={styles.savingsText}>-{savings}€</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.arrowBox}>
          <ArrowRight size={20} color={theme.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{category.name}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {filteredPlaces.length} {filteredPlaces.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
          </Text>
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.surface }]}>
          <Filter color={theme.text} size={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search color={theme.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={`Buscar en ${category.name}...`}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color={theme.textSecondary} size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.surface }]}>
              <Search color={theme.textSecondary} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No encontramos nada</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Prueba con otra búsqueda o categoría
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  placeCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  placeImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: '#F1F1F1',
  },
  placeInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 2,
  },
  arrowBox: {
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
