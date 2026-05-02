import React, { useState } from 'react';
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
import { ChevronLeft, Info, Sun, Moon, MapPin } from 'lucide-react-native';
import { mapStyles } from '../theme/mapStyles';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';

export function MapScreen({ route, navigation }) {
  const { city } = route.params || {};
  const { theme } = useTheme();
  const { userData } = useUser();
  const [mapTheme, setMapTheme] = useState('dark');
  
  // Obtener monumentos de la ciudad seleccionada o todos
  const displayMonuments = city ? (MONUMENTOS[city.name] || []) : Object.values(MONUMENTOS).flat();

  // Calcular color del marcador basado en beneficios reales
  const getMarkerColor = (monument) => {
    const isFree = monument.disabilityBenefit.toLowerCase().includes('gratis') || 
                   monument.disabilityBenefit.toLowerCase().includes('gratuita');
    
    if (isFree) return '#2ECC71'; // Verde: Gratis
    if (monument.disabilityBenefit.toLowerCase().includes('reducida') || 
        monument.disabilityBenefit.toLowerCase().includes('descuento')) return '#3498db'; // Azul: Descuento
    return '#E67E22'; // Naranja: General
  };

  const toggleTheme = () => {
    setMapTheme(mapTheme === 'dark' ? 'light' : 'dark');
  };

  // Región inicial: Centrar en el primer monumento si hay ciudad
  const initialRegion = displayMonuments.length > 0 ? {
    latitude: displayMonuments[0].location.latitude,
    longitude: displayMonuments[0].location.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: 40.4168, // Madrid por defecto
    longitude: -3.7038,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={mapTheme === 'dark' ? "light-content" : "dark-content"} />
      
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={mapTheme === 'dark' ? mapStyles.dark : mapStyles.light}
      >
        {displayMonuments.map((monument) => (
          <Marker
            key={monument.id}
            coordinate={monument.location}
          >
            <View style={styles.customMarker}>
              <MapPin 
                size={34} 
                color={getMarkerColor(monument)} 
                fill={getMarkerColor(monument) + '30'}
              />
            </View>

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

      {/* UI Overlay */}
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

        {/* Legend */}
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
  customMarker: {
    padding: 5,
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
