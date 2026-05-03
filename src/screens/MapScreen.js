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
import { ChevronLeft, ChevronRight, Info, Sun, Moon, MapPin, LocateFixed } from 'lucide-react-native';
import { mapStyles } from '../theme/mapStyles';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';

export function MapScreen({ route, navigation }) {
  const { city, filter, monuments: passedMonuments } = route.params || {};
  const { theme } = useTheme();
  const { userData } = useUser();
  const mapRef = useRef(null);
  const [mapTheme, setMapTheme] = useState('dark');
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);

  // Función para normalizar texto (quitar acentos)
  const normalize = (text) => {
    if (!text) return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

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
    return normalize(p.city) === normalize(city.name);
  });

  const mergedMonumentsMap = new Map();
  // Usar una clave normalizada para evitar duplicados por mayúsculas/minúsculas
  officialMonuments.forEach(m => {
    const key = `${normalize(m.name)}-${normalize(m.city || city?.name || '')}`;
    mergedMonumentsMap.set(key, { ...m, city: m.city || city?.name });
  });
  
  userContributions.forEach(m => {
    const key = `${normalize(m.name)}-${normalize(m.city)}`;
    mergedMonumentsMap.set(key, { ...m }); // Las contribuciones del usuario pueden sobrescribir datos oficiales si tienen el mismo nombre/ciudad
  });

  let displayMonuments = Array.from(mergedMonumentsMap.values());

  // Aplicar FILTRO COSTE CERO o FILTRO DE LUGAR ESPECÍFICO
  if ((filter === 'free' || filter === 'place') && passedMonuments) {
    displayMonuments = passedMonuments;
  }

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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    if (displayMonuments.length > 0) {
      return {
        latitude: Number(displayMonuments[0].location?.latitude || 40.4168),
        longitude: Number(displayMonuments[0].location?.longitude || -3.7038),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    return {
      latitude: 40.4168,
      longitude: -3.7038,
      latitudeDelta: 8,
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
        {displayMonuments.map((monument, idx) => (
          <Marker
            key={`${monument.id || 'mon'}-${normalize(monument.name)}-${idx}`}
            coordinate={{
              latitude: Number(monument.location?.latitude || 40.4168),
              longitude: Number(monument.location?.longitude || -3.7038)
            }}
            pinColor={getMarkerColor(monument)}
          >
            <Callout 
              tooltip={false}
              onPress={() => navigation.navigate('PlaceDetail', { place: monument })}
            >
              <View style={styles.callout}>
                <Text style={styles.calloutCategory}>{(monument.category || 'Lugar').toUpperCase()}</Text>
                <Text style={styles.calloutTitle}>{monument.name}</Text>
                <Text style={styles.calloutPrice}>{monument.price || 'Consultar precio'}</Text>
                <View style={styles.divider} />
                <Text style={[styles.calloutAction, { color: colors.primary }]}>VER FICHA COMPLETA</Text>
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

          {filter === 'free' && (
            <View style={styles.freeBanner}>
              <LocateFixed color="#FFF" size={16} />
              <Text style={styles.freeBannerText}>RUTA COSTE CERO</Text>
            </View>
          )}

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
    width: 240,
    minHeight: 100,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  calloutCategory: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6366f1',
    marginBottom: 4,
    letterSpacing: 1,
  },
  calloutTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  calloutPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  calloutAction: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
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
  freeBanner: {
    backgroundColor: '#2ECC71',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  freeBannerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
