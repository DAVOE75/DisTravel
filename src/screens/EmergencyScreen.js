import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Linking, 
  Platform,
  Share,
  Alert
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  Phone, 
  MapPin, 
  Share2, 
  ShieldAlert,
  Hospital,
  TriangleAlert
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { typography } from '../theme/typography';

export function EmergencyScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [location, setLocation] = useState('Localizando...');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocation('Permiso denegado');
          return;
        }

        // Intentar obtener ubicación rápida
        let loc = await Location.getLastKnownPositionAsync({});
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }
        
        if (loc) {
          setCoords(loc.coords);
          let address = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });

          if (address && address.length > 0) {
            const item = address[0];
            const fullAddress = `${item.street || ''} ${item.name || ''}, ${item.city || ''}`;
            setLocation(fullAddress.trim() || `Lat: ${loc.coords.latitude.toFixed(3)}`);
          }
        }
      } catch (error) {
        setLocation('GPS no disponible');
      }
    };
    getLocation();
  }, []);

  const callEmergency = () => {
    const phoneNumber = Platform.OS === 'android' ? 'tel:112' : 'telprompt:112';
    Linking.openURL(phoneNumber);
  };

  const shareLocation = async () => {
    try {
      const mapsUrl = coords ? `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}` : '';
      await Share.share({
        message: `¡Necesito ayuda! Mi ubicación actual es: ${location}. \n\nMapa: ${mapsUrl}`,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la ubicación');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Emergencia SOS</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.alertIconContainer}>
          <ShieldAlert color="#E74C3C" size={80} />
          <Text style={[styles.alertTitle, { color: theme.text }]}>¿Necesitas Ayuda?</Text>
          <Text style={[styles.alertSub, { color: theme.textSecondary }]}>Utiliza estas herramientas solo en caso de emergencia real.</Text>
        </View>

        {/* SOS BUTTON */}
        <TouchableOpacity 
          style={styles.sosButton} 
          onPress={callEmergency}
          activeOpacity={0.8}
        >
          <View style={styles.sosInner}>
            <Phone color="#FFFFFF" size={40} />
            <Text style={styles.sosText}>LLAMAR 112</Text>
          </View>
        </TouchableOpacity>

        {/* Location Info */}
        <View style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.locationHeader}>
            <MapPin color="#E74C3C" size={24} />
            <Text style={[styles.locationTitle, { color: theme.text }]}>Tu Ubicación Actual</Text>
          </View>
          <Text style={[styles.addressText, { color: theme.text }]}>{location}</Text>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.primary }]} onPress={shareLocation}>
            <Share2 color="#070B14" size={20} />
            <Text style={[styles.shareBtnText, { color: '#070B14' }]}>Compartir con contacto</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Services */}
        <View style={styles.servicesGrid}>
          <TouchableOpacity 
            style={[styles.serviceItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/hospital+cerca+de+mi/@${coords?.latitude},${coords?.longitude},15z`)}
          >
            <Hospital color={theme.primary} size={24} />
            <Text style={[styles.serviceLabel, { color: theme.text }]}>Hospitales</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.serviceItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/comisaria+cerca+de+mi/@${coords?.latitude},${coords?.longitude},15z`)}
          >
            <TriangleAlert color="#F1C40F" size={24} />
            <Text style={[styles.serviceLabel, { color: theme.text }]}>Comisarías</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  alertIconContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 15,
  },
  alertSub: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 30,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 40,
  },
  sosInner: {
    alignItems: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  locationCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  addressText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  shareBtnText: {
    color: '#070B14',
    fontWeight: '700',
    marginLeft: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  serviceItem: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  serviceLabel: {
    marginTop: 10,
    fontWeight: '700',
  }
});
