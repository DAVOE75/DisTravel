import * as Location from 'expo-location';
import { Alert } from 'react-native';

export class ProximityService {
  static lastNotificationId = null;
  static proximityThreshold = 200; // metros

  static async startWatching(places, onNearbyPlace) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10,
        timeInterval: 10000,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        
        places.forEach(place => {
          const distance = this.calculateDistance(
            latitude, 
            longitude, 
            place.location.latitude, 
            place.location.longitude
          );

          if (distance <= this.proximityThreshold && this.lastNotificationId !== place.id) {
            this.lastNotificationId = place.id;
            onNearbyPlace(place);
            this.triggerSmartAlert(place);
          }
        });
      }
    );
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  static triggerSmartAlert(place) {
    Alert.alert(
      "📍 ¡Lugar cercano!",
      `Estás cerca de ${place.name}. Recuerda que tienes beneficios de accesibilidad y ahorro verificados aquí.`,
      [{ text: "Ver detalles", onPress: () => {} }]
    );
  }
}
