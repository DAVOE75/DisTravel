import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  FlatList,
  Linking
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Navigation,
  CheckCircle2,
  Wind
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { typography } from '../theme/typography';

const MOCK_TOILETS = [
  {
    id: 'ct-1',
    name: 'Teatro Romano de Cartagena',
    coords: { latitude: 37.5991, longitude: -0.9845 },
    rating: 4.9,
    features: ['Ascensor PMR', 'Barras de apoyo'],
    cleanliness: 'Excelente'
  },
  {
    id: 'ct-2',
    name: 'Puerto de Cartagena (Paseo Alfonso XII)',
    coords: { latitude: 37.5975, longitude: -0.9821 },
    rating: 4.5,
    features: ['Acceso a nivel', 'Espacio amplio'],
    cleanliness: 'Muy Buena'
  },
  {
    id: 'ct-3',
    name: 'Museo ARQUA (Aseos Adaptados)',
    coords: { latitude: 37.5968, longitude: -0.9805 },
    rating: 4.7,
    features: ['Cambiador', 'Alarma SOS'],
    cleanliness: 'Excelente'
  },
  {
    id: '1',
    name: 'Museo del Prado (Madrid)',
    coords: { latitude: 40.4137, longitude: -3.6921 },
    rating: 4.8,
    features: ['Barras de apoyo', 'Cambiador'],
    cleanliness: 'Excelente'
  }
];

export function ToiletsScreen({ navigation }) {
  const { theme } = useTheme();
  const [userLocation, setUserLocation] = React.useState(null);
  const [toilets, setToilets] = React.useState(MOCK_TOILETS);

  React.useEffect(() => {
    const getLoc = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation(loc.coords);
          
          // Ordenar baños por cercanía
          const sorted = [...MOCK_TOILETS].sort((a, b) => {
            const distA = getDistanceNum(loc.coords.latitude, loc.coords.longitude, a.coords.latitude, a.coords.longitude);
            const distB = getDistanceNum(loc.coords.latitude, loc.coords.longitude, b.coords.latitude, b.coords.longitude);
            return distA - distB;
          });
          setToilets(sorted);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getLoc();
  }, []);

  const getDistanceNum = (lat1, lon1, lat2, lon2) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return 'Calcular...';
    // Fórmula de Haversine simplificada para distancias cortas
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    const d = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
  };

  const renderToilet = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.distance, { color: theme.primary }]}>
            {calculateDistance(userLocation?.latitude, userLocation?.longitude, item.coords.latitude, item.coords.longitude)}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Star color="#F1C40F" size={16} fill="#F1C40F" />
          <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.featuresRow}>
        {item.features.map((f, i) => (
          <View key={i} style={[styles.featureBadge, { backgroundColor: theme.primary + '10' }]}>
            <CheckCircle2 color={theme.primary} size={12} />
            <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.cleanliness}>
          <Wind color={theme.textSecondary} size={16} />
          <Text style={[styles.cleanText, { color: theme.textSecondary }]}>Limpieza: {item.cleanliness}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.navBtn, { backgroundColor: theme.primary }]}
          onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.coords.latitude},${item.coords.longitude}`)}
        >
          <Navigation color="#FFFFFF" size={18} />
          <Text style={styles.navBtnText}>Ir ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Baños Adaptados</Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={toilets}
          renderItem={renderToilet}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <Text style={[styles.listHeader, { color: theme.textSecondary }]}>Baños más cercanos a tu posición</Text>
          )}
        />
      </View>
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
  },
  headerTitle: {
    marginLeft: 15,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 15,
  },
  cleanliness: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 13,
  }
});
