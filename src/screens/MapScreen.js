import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { colors } from '../theme/colors';
import { MONUMENTOS } from '../data/monumentos';
import { ChevronLeft, Info, Sun, Moon, MapPin, LocateFixed } from 'lucide-react-native';
import { mapStyles } from '../theme/mapStyles';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';

export function MapScreen({ route, navigation }) {
  const { city } = route.params || {};
  const { theme } = useTheme();
  const { userData } = useUser();
  const mapRef = useRef(null);
  const [mapTheme, setMapTheme] = useState('dark');
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);

  // Mock de "Pasillos Seguros" (Rutas verificadas accesibles)
  const safeCorridors = [
    {
      id: 'alicante-port-castle',
      coordinates: [
        { latitude: 38.3444, longitude: -0.4789 }, // Puerto
        { latitude: 38.3456, longitude: -0.4805 }, // Explanada
        { latitude: 38.3472, longitude: -0.4815 }, // Plaza Ayuntamiento
        { latitude: 38.3488, longitude: -0.4795 }, // Subida Castillo
      ],
      title: 'Pasillo Esmeralda: Puerto-Castillo'
    }
  ];
  
  // Obtener monumentos: FUSIONAR estáticos con contribuciones
  const officialMonuments = city ? (MONUMENTOS[city.name] || []) : Object.values(MONUMENTOS).flat();
  const userContributions = (userData?.contributions || []).filter(p => {
    if (!city) return true;
    return p.city.toLowerCase() === city.name.toLowerCase();
  });

  const mergedMonumentsMap = new Map();
  officialMonuments.forEach(m => mergedMonumentsMap.set(`${m.name}-${m.city || city?.name}`, m));
  userContributions.forEach(m => mergedMonumentsMap.set(`${m.name}-${m.city}`, m));

  const displayMonuments = Array.from(mergedMonumentsMap.values());

  const getMarkerColor = (monument) => {
    try {
      const benefit = (monument.disabilityBenefit || monument.freeInfo || '').toLowerCase();
      let isFree = benefit.includes('gratis') || benefit.includes('gratuita');
      if (!isFree && monument.tariffs && Array.isArray(monument.tariffs)) {
        isFree = monument.tariffs.some(t => 
          (t.label?.toLowerCase().includes('pcd') || t.label?.toLowerCase().includes('reducida')) && 
          t.price?.toLowerCase().includes('gratis')
        );
      }
      const isDiscounted = benefit.includes('reducida') || benefit.includes('descuento') || 
                          (monument.tariffs && Array.isArray(monument.tariffs) && monument.tariffs.some(t => t.label?.toLowerCase().includes('pcd')));

      if (isFree) return '#2ECC71'; 
      if (isDiscounted) return '#3498db'; 
      return '#E67E22'; 
    } catch (e) {
      return '#E67E22';
    }
  };

  const toggleTheme = () => {
    setMapTheme(mapTheme === 'dark' ? 'light' : 'dark');
  };

  const initialRegion = React.useMemo(() => {
    if (city && city.location) {
      return {
        ...city.location,
        latitudeDelta: 0.01, // Más zoom (antes 0.05)
        longitudeDelta: 0.01,
      };
    }
    if (displayMonuments.length > 0) {
      return {
        latitude: displayMonuments[0].location?.latitude || 40.4168,
        longitude: displayMonuments[0].location?.longitude || -3.7038,
        latitudeDelta: 0.02, // Más zoom (antes 0.1)
        longitudeDelta: 0.02,
      };
    }
    return {
      latitude: 40.4168,
      longitude: -3.7038,
      latitudeDelta: 8, // Vista general un poco más cerrada
      longitudeDelta: 8,
    };
  }, [city, displayMonuments]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={mapTheme === 'dark' ? "light-content" : "dark-content"} />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={mapTheme === 'dark' ? mapStyles.dark : mapStyles.light}
      >
        {showRoutes && safeCorridors.map(route => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor="#2ECC71"
            strokeWidth={4}
            lineDashPattern={[0]}
            geodesic={true}
          />
        ))}
        {displayMonuments.map((monument) => (
          <Marker
            key={monument.id}
            coordinate={{
              latitude: Number(monument.location?.latitude || 40.4168),
              longitude: Number(monument.location?.longitude || -3.7038)
            }}
            pinColor={getMarkerColor(monument)}
          >
            <Callout 
              tooltip
              onPress={() => navigation.navigate('PlaceDetail', { place: monument })}
            >
              <View style={[styles.callout, { backgroundColor: '#FFFFFF', borderRadius: 16 }]}>
                <Text style={styles.calloutTitle}>{monument.name}</Text>
                <Text style={styles.calloutPrice}>{monument.price}</Text>
                <View style={styles.infoRow}>
                  <Info size={12} color="#E67E22" />
                  <Text style={styles.calloutAction}>Toca para info total</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={mapTheme === 'dark' ? colors.text : '#000000'} size={24} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}
            onPress={toggleTheme}
          >
            {mapTheme === 'dark' ? (
              <Sun color="#f1c40f" size={22} />
            ) : (
              <Moon color="#2c3e50" size={22} />
            )}
          </TouchableOpacity>
        </View>

        {/* Recenter Button */}
        <TouchableOpacity 
          style={[styles.recenterButton, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : '#FFFFFF' }]}
          onPress={() => {
            mapRef.current?.animateToRegion(initialRegion, 1000);
          }}
        >
          <LocateFixed color={colors.primary} size={24} />
        </TouchableOpacity>

        <View style={[styles.legend, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF' }]}>
          <Text style={[styles.legendTitle, { color: mapTheme === 'dark' ? colors.text : '#0f172a' }]}>Tus Beneficios en el Mapa</Text>
          
          <View style={styles.legendRow}>
            <MapPin size={20} color={colors.success} fill={colors.success + '40'} />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: colors.success }]}>ACCESO GRATIS</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>No pagas entrada por tu perfil</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <MapPin size={20} color="#3498db" fill="#3498db40" />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: '#3498db' }]}>TARIFA REDUCIDA</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>Tienes un descuento aplicado</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <MapPin size={20} color={colors.primary} fill={colors.primary + '40'} />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: colors.primary }]}>TARIFA GENERAL</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>Precio estándar sin beneficios</Text>
            </View>
          </View>

          <View style={[styles.legendRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={{ width: 20, height: 4, backgroundColor: '#2ECC71', borderRadius: 2, marginTop: 8 }} />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: '#2ECC71' }]}>PASILLO SEGURO (v3.0)</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>Ruta 100% accesible verificada</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 240, // Encima de la leyenda
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  callout: {
    width: 220,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
    color: '#0f172a',
  },
  calloutPrice: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutAction: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  legendTitle: {
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  legendTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  legendSub: {
    fontSize: 12,
    fontWeight: '500',
  },
});
