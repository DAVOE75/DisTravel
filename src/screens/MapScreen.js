import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

import { colors } from '../theme/colors';
import { MONUMENTOS } from '../data/monumentos';
import { ChevronLeft, Sun, Moon, MapPin, Locate } from 'lucide-react-native';
import { mapStyles } from '../theme/mapStyles';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import * as Location from 'expo-location';

// Normalizar componentes (evitar error 'Element type is invalid')
const MapViewComponent = MapView?.default || MapView;
const MarkerComponent = Marker?.default || Marker;
const CalloutComponent = Callout?.default || Callout;

// Normalizar iconos
const ChevronLeftIcon = ChevronLeft?.default || ChevronLeft;
const SunIcon = Sun?.default || Sun;
const MoonIcon = Moon?.default || Moon;
const MapPinIcon = MapPin?.default || MapPin;
const LocateIcon = Locate?.default || Locate;

export default function MapScreen({ route, navigation }) {
  const { city, filter, monuments: passedMonuments } = route.params || {};
  const { theme } = useTheme();
  const { userData } = useUser();
  const mapRef = useRef(null);
  const [mapTheme, setMapTheme] = useState('dark');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  // Función para normalizar texto (quitar acentos)
  const normalize = (text) => {
    if (!text) return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Obtener monumentos
  const officialMonuments = city ? (MONUMENTOS[city.name] || []) : Object.values(MONUMENTOS).flat();
  const userContributions = (userData?.contributions || []).filter(p => {
    if (!city) return true;
    return normalize(p.city) === normalize(city.name);
  });

  const mergedMonumentsMap = new Map();
  officialMonuments.forEach(m => {
    if (!m) return;
    const key = `${normalize(m.name)}-${normalize(m.city || city?.name || '')}`;
    mergedMonumentsMap.set(key, { ...m, city: m.city || city?.name });
  });
  
  userContributions.forEach(m => {
    if (!m) return;
    const key = `${normalize(m.name)}-${normalize(m.city)}`;
    mergedMonumentsMap.set(key, { ...m });
  });

  let displayMonuments = Array.from(mergedMonumentsMap.values());

  if ((filter === 'free' || filter === 'place') && passedMonuments) {
    displayMonuments = passedMonuments;
  }

  const getMarkerColor = (monument) => {
    try {
      const userDegree = parseInt(userData.disabilityDegree) || 0;
      let bestPriceType = 'general'; // 'free', 'reduced', 'general'

      // 1. Analizar tarifas estructuradas (formato nuevo)
      if (monument.tariffs && Array.isArray(monument.tariffs) && monument.tariffs.length > 0) {
        monument.tariffs.forEach(t => {
          const label = (t.label || '').toLowerCase();
          const priceStr = (t.price || '').toLowerCase();
          const isZero = priceStr.includes('gratis') || priceStr.includes('0') || priceStr.includes('0.00');
          
          // Verificar si aplica al usuario por condición estructurada
          let applies = false;
          const cond = t.condition;
          if (cond) {
            if (cond.type === 'disability') {
              const reqDegree = parseInt(cond.value) || 33;
              if (userDegree >= reqDegree) applies = true;
            } else if (cond.type === 'none') {
              // Si no hay condición, es general o aplica a todos
            }
          }

          // Si no hay condición estructurada, buscar palabras clave
          if (!cond || cond.type === 'none') {
            if (label.includes('pcd') || label.includes('discapacidad') || label.includes('reducida')) {
              applies = true;
            }
          }

          if (applies) {
            if (isZero) bestPriceType = 'free';
            else if (bestPriceType !== 'free') bestPriceType = 'reduced';
          }
        });
      }

      // 2. Fallback a campos de texto legados si no se determinó como gratis aún
      if (bestPriceType !== 'free') {
        const benefit = (monument.disabilityBenefit || monument.freeInfo || monument.price || '').toLowerCase();
        const isFreeLegacy = benefit.includes('gratis') || benefit.includes('gratuita') || benefit.includes(' 0€') || benefit.includes(' 0 €');
        
        if (isFreeLegacy) {
          // Si el texto dice gratis, asumimos que es para el usuario si menciona PCD o si es el precio general
          if (benefit.includes('pcd') || benefit.includes('discapacidad') || !benefit.includes(':')) {
            bestPriceType = 'free';
          }
        } else if (bestPriceType === 'general') {
          const isReducedLegacy = benefit.includes('reducida') || benefit.includes('descuento') || benefit.includes('beneficio');
          if (isReducedLegacy) bestPriceType = 'reduced';
        }
      }

      if (bestPriceType === 'free') return '#2ECC71'; // Verde
      if (bestPriceType === 'reduced') return '#3498db'; // Azul
      return '#E67E22'; // Naranja (General)
    } catch (e) {
      console.warn('Error en getMarkerColor:', e);
      return '#E67E22';
    }
  };

  const initialRegion = {
    latitude: city?.location?.latitude || (displayMonuments.length > 0 ? displayMonuments[0].location?.latitude : 40.4168) || 40.4168,
    longitude: city?.location?.longitude || (displayMonuments.length > 0 ? displayMonuments[0].location?.longitude : -3.7038) || -3.7038,
    latitudeDelta: city ? 0.01 : 10,
    longitudeDelta: city ? 0.01 : 10,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={mapTheme === 'dark' ? "light-content" : "dark-content"} />
      
      {MapViewComponent ? (
        <MapViewComponent
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          customMapStyle={mapTheme === 'dark' ? mapStyles.dark : mapStyles.light}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {displayMonuments.map((monument, idx) => {
            if (!monument.location || !monument.location.latitude) return null;
            return (
              <MarkerComponent
                key={`${monument.id || 'mon'}-${idx}`}
                coordinate={{
                  latitude: Number(monument.location.latitude),
                  longitude: Number(monument.location.longitude)
                }}
                pinColor={getMarkerColor(monument)}
              >
                <CalloutComponent 
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
                </CalloutComponent>
              </MarkerComponent>
            );
          })}
        </MapViewComponent>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#FFF' }}>Cargando mapa...</Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftIcon color={mapTheme === 'dark' ? colors.text : '#000000'} size={24} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}
            onPress={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
          >
            {mapTheme === 'dark' ? (
              <SunIcon color="#f1c40f" size={22} />
            ) : (
              <MoonIcon color="#2c3e50" size={22} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.recenterButton, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : '#FFFFFF' }]}
          onPress={async () => {
            if (userLocation) {
              mapRef.current?.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 1000);
            } else {
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location.coords);
                mapRef.current?.animateToRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 1000);
              } else {
                mapRef.current?.animateToRegion(initialRegion, 1000);
              }
            }
          }}
        >
          <LocateIcon color={colors.primary} size={24} />
        </TouchableOpacity>

        <View style={[styles.legend, { backgroundColor: mapTheme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF' }]}>
          <Text style={[styles.legendTitle, { color: mapTheme === 'dark' ? colors.text : '#0f172a' }]}>Tus Beneficios en el Mapa</Text>
          
          <View style={styles.legendRow}>
            <MapPinIcon size={20} color={colors.success} fill={colors.success + '40'} />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: colors.success }]}>ACCESO GRATIS</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>No pagas entrada por tu perfil</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <MapPinIcon size={20} color="#3498db" fill="#3498db40" />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: '#3498db' }]}>TARIFA REDUCIDA</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>Tienes un descuento aplicado</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <MapPinIcon size={20} color={colors.primary} fill={colors.primary + '40'} />
            <View style={styles.legendTextContainer}>
              <Text style={[styles.legendLabel, { color: colors.primary }]}>TARIFA GENERAL</Text>
              <Text style={[styles.legendSub, { color: mapTheme === 'dark' ? colors.textSecondary : '#64748b' }]}>Precio estándar sin beneficios</Text>
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
    backgroundColor: '#000',
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
    bottom: 240,
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
    width: 200,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  calloutCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  calloutPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 5,
  },
  calloutAction: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
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
  }
});
