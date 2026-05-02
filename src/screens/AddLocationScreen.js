import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Ticket, 
  Info, 
  Plus, 
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import { typography } from '../theme/typography';

import MapView, { Marker } from 'react-native-maps';

export function AddLocationScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { updateUserData, userData } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    city: 'Madrid', // Default o detectado
    schedule: '',
    priceGeneral: '',
    priceDisability: '',
  });

  const [location, setLocation] = useState({
    latitude: 40.4168,
    longitude: -3.7038,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const handleSave = async () => {
    if (!formData.name || !formData.priceGeneral) {
      Alert.alert('Faltan datos', 'El nombre y el precio son obligatorios para ayudar a otros usuarios.');
      return;
    }

    const newPlace = {
      id: Date.now().toString(),
      ...formData,
      location,
      isUserAdded: true,
      verified: false
    };

    const currentContributions = userData.contributions || [];
    const currentPoints = userData.points || 0;
    
    await updateUserData({
      contributions: [...currentContributions, newPlace],
      points: currentPoints + 50
    });

    Alert.alert(
      '¡Objetivo Logrado! 🏆', 
      'Has ganado +50 Puntos Distravel por añadir este lugar en tiempo real. ¡Gracias por ayudar a la comunidad!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={theme.text} size={28} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Añadir Lugar</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Map Selection Section */}
          <View style={[styles.mapContainer, { borderColor: theme.border }]}>
            <MapView
              style={styles.map}
              initialRegion={location}
              onRegionChangeComplete={(region) => setLocation(region)}
            >
              <Marker coordinate={location} pinColor={theme.primary} />
            </MapView>
            <View style={styles.mapOverlay}>
              <View style={[styles.locationPin, { backgroundColor: theme.primary }]}>
                <MapPin color="#FFFFFF" size={20} />
              </View>
              <Text style={styles.mapHint}>Mueve el mapa para ajustar la posición</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre del Monumento / Lugar</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                placeholder="Ej: Catedral de la Almudena"
                placeholderTextColor={theme.textSecondary + '80'}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Precio Gral.</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  placeholder="10€"
                  keyboardType="numeric"
                  value={formData.priceGeneral}
                  onChangeText={(text) => setFormData({...formData, priceGeneral: text})}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>P. Discapacidad</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  placeholder="5€ / Gratis"
                  value={formData.priceDisability}
                  onChangeText={(text) => setFormData({...formData, priceDisability: text})}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Horario de Visita</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                placeholder="Ej: 10:00 - 18:00"
                value={formData.schedule}
                onChangeText={(text) => setFormData({...formData, schedule: text})}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Confirmar y Añadir</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 25,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    pointerEvents: 'none',
  },
  locationPin: {
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  mapHint: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: '700',
  },
  formCard: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 55,
    borderWidth: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  saveButton: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  }
});
