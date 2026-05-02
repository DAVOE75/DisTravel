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
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import * as Location from 'expo-location';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Ticket, 
  Info, 
  Plus, 
  Camera,
  CheckCircle,
  AlertCircle,
  Trash2,
  Building2,
  Calendar
} from 'lucide-react-native';
import { typography } from '../theme/typography';
import MapView, { Marker } from 'react-native-maps';

const CATEGORIES = ['Museo', 'Iglesia', 'Parque', 'Restaurante', 'Hotel', 'Atracción'];
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function AddLocationScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { updateUserData, userData } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Museo',
    freeInfo: '',
  });

  const [tariffs, setTariffs] = useState([
    { id: '1', label: 'Adulto', price: '' },
    { id: '2', label: 'Discapacitado', price: '' }
  ]);

  const [openingDays, setOpeningDays] = useState({
    'Lun': true, 'Mar': true, 'Mié': true, 'Jue': true, 'Vie': true, 'Sáb': true, 'Dom': true
  });

  const [location, setLocation] = useState({
    latitude: 40.4168,
    longitude: -3.7038,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // 1. Geolocalizar al usuario al entrar
  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let currentPos = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: currentPos.coords.latitude,
          longitude: currentPos.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setLocation(newRegion);
      }
    })();
  }, []);

  // 2. Smart Pinning: Buscar por nombre al perder el foco (onBlur)
  const searchPlaceByName = async () => {
    if (formData.name.length < 5) return;
    
    setIsSearchingLocation(true);
    try {
      const results = await Location.geocodeAsync(formData.name);
      if (results && results.length > 0) {
        const newRegion = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setLocation(newRegion);
      }
    } catch (error) {
      console.log('Geocode error:', error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const addTariff = () => {
    setTariffs([...tariffs, { id: Date.now().toString(), label: '', price: '' }]);
  };

  const removeTariff = (id) => {
    setTariffs(tariffs.filter(t => t.id !== id));
  };

  const updateTariff = (id, field, value) => {
    setTariffs(tariffs.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleDay = (day) => {
    setOpeningDays({ ...openingDays, [day]: !openingDays[day] });
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Faltan datos', 'El nombre del lugar es obligatorio.');
      return;
    }

    const newPlace = {
      id: Date.now().toString(),
      ...formData,
      tariffs,
      openingDays,
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
      '¡Lugar Registrado! 🏆', 
      'Has ganado +50 Puntos Distravel por tu contribución. ¡La comunidad te lo agradece!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={theme.text} size={28} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Añadir Lugar</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Map Selection */}
          <View style={[styles.mapContainer, { borderColor: theme.border }]}>
            <MapView
              style={styles.map}
              region={location}
              onRegionChangeComplete={(region) => setLocation(region)}
            >
              <Marker coordinate={location} />
            </MapView>
            <View style={styles.mapOverlay}>
              {isSearchingLocation ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <MapPin color={theme.primary} size={30} />
              )}
              <Text style={styles.mapHint}>
                {isSearchingLocation ? 'Buscando ubicación...' : 'Mueve el mapa para situar el pin'}
              </Text>
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Información General</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Building2 color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nombre (ej: Museo Naval Cartagena)"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                onBlur={searchPlaceByName}
              />
            </View>
            
            {/* Category Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  style={[
                    styles.catBadge, 
                    { borderColor: theme.border, backgroundColor: theme.surface },
                    formData.category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setFormData({...formData, category: cat})}
                >
                  <Text style={[styles.catText, { color: theme.textSecondary }, formData.category === cat && { color: '#FFF' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tariffs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Tarifas y Precios (€)</Text>
              <TouchableOpacity onPress={addTariff} style={[styles.addButton, { backgroundColor: theme.primary }]}>
                <Plus color="#FFF" size={16} />
              </TouchableOpacity>
            </View>
            
            {tariffs.map((tariff) => (
              <View key={tariff.id} style={styles.tariffRow}>
                <View style={[styles.tariffInput, { backgroundColor: theme.surface, borderColor: theme.border, flex: 2 }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Tipo (ej: Adulto)"
                    placeholderTextColor={theme.textSecondary}
                    value={tariff.label}
                    onChangeText={(v) => updateTariff(tariff.id, 'label', v)}
                  />
                </View>
                <View style={[styles.tariffInput, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1, marginLeft: 10 }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="€"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={tariff.price}
                    onChangeText={(v) => updateTariff(tariff.id, 'price', v)}
                  />
                </View>
                <TouchableOpacity onPress={() => removeTariff(tariff.id)} style={styles.trashBtn}>
                  <Trash2 color="#E74C3C" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Días de Apertura</Text>
            <View style={styles.daysRow}>
              {DAYS.map(day => (
                <TouchableOpacity 
                  key={day}
                  style={[
                    styles.dayCircle, 
                    { borderColor: theme.border, backgroundColor: theme.surface },
                    openingDays[day] && { backgroundColor: theme.success, borderColor: theme.success }
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayText, { color: theme.textSecondary }, openingDays[day] && { color: '#FFF' }]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 15 }]}>
              <Info color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Info entrada gratuita (ej: Domingos gratis)"
                placeholderTextColor={theme.textSecondary}
                value={formData.freeInfo}
                onChangeText={(text) => setFormData({...formData, freeInfo: text})}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <CheckCircle color="#FFFFFF" size={22} />
            <Text style={styles.saveButtonText}>Publicar Lugar Accesible</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  mapContainer: { height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 20 },
  map: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  mapHint: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 5 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, borderRadius: 15, borderWidth: 1 },
  input: { flex: 1, marginLeft: 12, fontSize: 15 },
  categoryScroll: { marginTop: 12 },
  catBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  catText: { fontSize: 13, fontWeight: '600' },
  tariffRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tariffInput: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center' },
  addButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  trashBtn: { marginLeft: 10, padding: 5 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 12, fontWeight: '700' },
  saveButton: { flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginLeft: 12 }
});
