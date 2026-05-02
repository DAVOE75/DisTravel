import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  Camera, 
  MapPin, 
  Clock, 
  CreditCard, 
  Plus, 
  Trash2, 
  Info, 
  Building2,
  Calendar,
  Maximize2,
  Check,
  Tag,
  Languages,
  Phone,
  Globe,
  Sparkles,
  Zap,
  LayoutList,
  Eye,
  Ear,
  Brain,
  Accessibility
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { typography } from '../theme/typography';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const CATEGORIES = ['Museo', 'Iglesia', 'Parque', 'Restaurante', 'Hotel', 'Atracción'];
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function AddLocationScreen({ route, navigation }) {
  const { defaultCity } = route.params || {};
  const { theme, isDarkMode } = useTheme();
  const { updateUserData } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Museo',
    city: defaultCity || '',
    province: '',
    description: '',
    touristTip: '',
    website: '',
    phone: '',
    tags: '',
    freeInfo: '',
    importantNotices: [],
    seasons: [],
    isSplitSchedule: false,
    morningOpen: '10:00',
    morningClose: '14:00',
    afternoonOpen: '16:00',
    afternoonClose: '20:00',
    closedHolidays: true,
    image: null,
  });

  const [accessibilityFeatures, setAccessibilityFeatures] = useState({
    physical: true,
    visual: false,
    auditory: false,
    cognitive: false
  });

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [tariffs, setTariffs] = useState([
    { id: '1', label: 'Adulto', price: '' },
    { id: '2', label: 'PCD / Discapacidad', price: '0' }
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
  const [isMapExpanded, setIsMapExpanded] = useState(false);

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

  const normalize = (text) => 
    text?.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i') || '';

  const mapRef = React.useRef(null);

  const handleAIAutoFill = async () => {
    if (!formData.name) {
      Alert.alert("Nombre necesario", "Escribe el nombre del lugar para que la IA pueda buscarlo.");
      return;
    }

    setIsRecognizing(true);
    
    setTimeout(() => {
      const nameNorm = normalize(formData.name);
      let aiData = null;

      if (nameNorm.includes('prado')) {
        aiData = {
          name: "Museo Nacional del Prado",
          category: "Museo",
          city: "Madrid",
          province: "Madrid",
          description: "La pinacoteca más importante de España. Alberga obras de Velázquez, Goya y El Bosco.",
          touristTip: "Visita gratuita de 18:00 a 20:00 (L-S) y 17:00 a 19:00 (D).",
          website: "www.museodelprado.es",
          phone: "+34 913 30 28 00",
          tags: "Arte, Historia, Cultura",
          freeInfo: "Gratis para PCD + Acompañante con acreditación.",
          importantNotices: [
            "Recomendamos reservar la entrada online incluso para el horario gratuito.",
            "El acceso para personas con movilidad reducida se realiza por la Puerta de Jerónimos."
          ],
          seasons: [
            {
              name: 'Horario General',
              period: 'Todo el año',
              weekday: '10:00 a 20:00',
              weekend: '10:00 a 19:00 (Domingos)'
            }
          ],
          image: "https://images.unsplash.com/photo-1543731068-7e0f5beff43a",
          location: { latitude: 40.4137, longitude: -3.6921, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          tariffs: [
            { id: 1, label: 'Entrada General', price: '15' },
            { id: 2, label: 'PCD / Discapacidad', price: '0' }
          ],
          accessibility: { physical: true, visual: true, auditory: true, cognitive: false }
        };
      } else if (nameNorm.includes('sagrada familia')) {
        aiData = {
          name: "Basílica de la Sagrada Familia",
          category: "Iglesia",
          city: "Barcelona",
          province: "Barcelona",
          description: "La obra maestra inacabada de Antoni Gaudí.",
          touristTip: "Reserva con antelación. La luz del atardecer es mágica.",
          website: "sagradafamilia.org",
          importantNotices: [
            "Se requiere vestimenta adecuada para entrar al templo.",
            "Los ascensores a las torres no son accesibles para sillas de ruedas."
          ],
          seasons: [
            {
              name: 'Horario Habitual',
              period: 'Todo el año',
              weekday: '09:00 a 18:00',
              weekend: '09:00 a 18:00'
            }
          ],
          image: "https://images.unsplash.com/photo-1583774558033-98898e144a0e",
          location: { latitude: 41.4036, longitude: 2.1744, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          tariffs: [
            { id: 1, label: 'Entrada General', price: '26' },
            { id: 2, label: 'PCD + Acompañante', price: '0' }
          ],
          accessibility: { physical: true, visual: true, auditory: false, cognitive: false }
        };
      } else if (nameNorm.includes('belmonte')) {
        aiData = {
          name: "Castillo de Belmonte",
          category: "Monumento",
          city: "Belmonte",
          province: "Cuenca",
          description: "Fortaleza gótico-mudéjar del siglo XV muy bien conservada.",
          touristTip: "Visitas teatralizadas espectaculares.",
          importantNotices: [
            "Sillas de ruedas gratis. Acompañante 50% dto.",
            "Consulte disponibilidad de visitas teatralizadas en su web."
          ],
          seasons: [
            {
              name: 'Horario Único',
              period: 'Todo el año',
              weekday: '10:00 a 14:00 y 15:30 a 18:30',
              weekend: '10:00 a 14:00 y 15:30 a 18:30'
            }
          ],
          image: "https://images.unsplash.com/photo-1599423300746-b62533397364",
          location: { latitude: 39.5583, longitude: -2.7011, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          tariffs: [
            { id: 1, label: 'Entrada General', price: '10' },
            { id: 2, label: 'Reducida (PCD)', price: '5' }
          ],
          accessibility: { physical: true, visual: false, auditory: false, cognitive: false }
        };
      } else if (nameNorm.includes('mota') || nameNorm.includes('medina')) {
        aiData = {
          name: "Castillo de la Mota",
          category: "Monumento",
          city: "Medina del Campo",
          province: "Valladolid",
          description: "Icono de la arquitectura militar de los Reyes Católicos.",
          importantNotices: [
            "Las visitas guiadas se realizan desde el Centro de Visitantes.",
            "Entrada libre al patio y exteriores."
          ],
          seasons: [
            {
              name: 'Invierno',
              period: '1 de octubre al 31 de marzo',
              weekday: '11:00 a 14:00 y 16:00 a 18:00',
              weekend: '11:00 a 14:00'
            },
            {
              name: 'Verano',
              period: '1 de abril al 30 de septiembre',
              weekday: '11:00 a 14:00 y 16:00 a 19:00',
              weekend: '11:00 a 14:00'
            }
          ],
          image: "https://images.unsplash.com/photo-1543731068-7e0f5beff43a",
          location: { latitude: 41.3094, longitude: -4.9103, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          tariffs: [
            { id: 1, label: 'Visita Guiada', price: '5' },
            { id: 2, label: 'PCD >70%', price: '0' }
          ],
          accessibility: { physical: true, visual: false, auditory: false, cognitive: false }
        };
      } else {
        aiData = {
          category: "Atracción",
          description: "Un lugar de interés turístico y cultural.",
          importantNotices: ["Consultar web oficial para horarios actualizados."],
          seasons: [{ name: 'Estándar', period: 'Todo el año', weekday: '10:00 a 18:00', weekend: '10:00 a 14:00' }],
          accessibility: { physical: true, visual: false, auditory: false, cognitive: false }
        };
      }

      setFormData(prev => ({
        ...prev,
        ...aiData,
        city: aiData.city || prev.city,
        name: aiData.name || prev.name
      }));
      
      if (aiData.tariffs) setTariffs(aiData.tariffs);
      if (aiData.location) {
        setLocation(aiData.location);
        mapRef.current?.animateToRegion(aiData.location, 1000);
      }
      if (aiData.accessibility) setAccessibilityFeatures(aiData.accessibility);
      
      setIsRecognizing(false);
      Alert.alert("¡IA Distravel!", `Información cargada para ${aiData.name || formData.name}.`);
    }, 1500);
  };

  const toggleDay = (day) => {
    setOpeningDays({ ...openingDays, [day]: !openingDays[day] });
  };

  const handleAIRecognition = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara para reconocer el lugar.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsRecognizing(true);
      setTimeout(() => {
        setIsRecognizing(false);
        setFormData(prev => ({ ...prev, name: 'Museo del Prado', city: 'Madrid' }));
        handleAIAutoFill();
      }, 2000);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const addSeason = () => {
    setFormData(prev => ({
      ...prev,
      seasons: [...(prev.seasons || []), { name: '', period: '', weekday: '', weekend: '' }]
    }));
  };

  const removeSeason = (index) => {
    setFormData(prev => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index)
    }));
  };

  const updateSeason = (index, field, value) => {
    const newSeasons = [...formData.seasons];
    newSeasons[index][field] = value;
    setFormData({ ...formData, seasons: newSeasons });
  };

  const addNotice = () => {
    setFormData(prev => ({
      ...prev,
      importantNotices: [...(prev.importantNotices || []), '']
    }));
  };

  const removeNotice = (index) => {
    setFormData(prev => ({
      ...prev,
      importantNotices: prev.importantNotices.filter((_, i) => i !== index)
    }));
  };

  const updateNotice = (index, value) => {
    const newNotices = [...formData.importantNotices];
    newNotices[index] = value;
    setFormData({ ...formData, importantNotices: newNotices });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.city) {
      Alert.alert("Campos incompletos", "Por favor, introduce al menos el nombre y la ciudad.");
      return;
    }

    setIsUploading(true);
    
    setTimeout(() => {
      const newPlace = {
        id: Date.now().toString(),
        ...formData,
        location,
        tariffs,
        openingDays,
        accessibility: accessibilityFeatures,
        isUserAdded: true,
        rating: 5.0,
        reviews: 0
      };

      updateUserData('contributions', (prev) => [...(prev || []), newPlace]);
      
      setIsUploading(false);
      Alert.alert("¡Enhorabuena!", "El lugar ha sido añadido y será visible tras la validación administrativa.", [
        { text: "Genial", onPress: () => navigation.goBack() }
      ]);
    }, 1500);
  };

  const toggleAccessibility = (key) => {
    setAccessibilityFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Añadir Nuevo Lugar</Text>
        <TouchableOpacity onPress={handleAIRecognition} style={styles.aiHeaderBtn}>
          <Sparkles color={theme.primary} size={22} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Upload Section */}
        <TouchableOpacity style={[styles.photoUpload, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={pickImage}>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={styles.previewImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera color={theme.textSecondary} size={40} />
              <Text style={[styles.photoText, { color: theme.textSecondary }]}>Subir Foto Principal</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Sections */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <LayoutList color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información General</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Building2 color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nombre del monumento o lugar"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
              <TouchableOpacity onPress={handleAIAutoFill} disabled={isRecognizing}>
                {isRecognizing ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Sparkles color={theme.primary} size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10 }]}>
              <MapPin color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Ciudad"
                placeholderTextColor={theme.textSecondary}
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10, height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Info color={theme.primary} size={20} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.input, { color: theme.text, height: 80, textAlignVertical: 'top' }]}
                placeholder="Descripción del lugar (Historia, qué ver...)"
                placeholderTextColor={theme.textSecondary}
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10, height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Sparkles color="#F1C40F" size={20} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.input, { color: theme.text, height: 60, textAlignVertical: 'top' }]}
                placeholder="Tip Turístico (Mejor hora, qué no perderse...)"
                placeholderTextColor={theme.textSecondary}
                multiline
                value={formData.touristTip}
                onChangeText={(text) => setFormData({...formData, touristTip: text})}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1 }]}>
                <Globe color={theme.primary} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Web"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.website}
                  onChangeText={(text) => setFormData({...formData, website: text})}
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <MapPin color={theme.primary} size={20} />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Dirección exacta (Calle, número...)"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Phone color={theme.primary} size={20} />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Teléfono de Reservas"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 10 }]}>
              <Tag color={theme.primary} size={20} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Etiquetas (separadas por comas)"
                placeholderTextColor={theme.textSecondary}
                value={formData.tags}
                onChangeText={(text) => setFormData({...formData, tags: text})}
              />
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setFormData({...formData, category: cat})}
                  style={[
                    styles.categoryBtn, 
                    { backgroundColor: formData.category === cat ? theme.primary : theme.surface, borderColor: theme.border }
                  ]}
                >
                  <Text style={[styles.categoryText, { color: formData.category === cat ? '#FFF' : theme.text }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Accessibility Features Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Accessibility color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesibilidad Adaptada</Text>
          </View>
          
          <View style={styles.accessibilityGrid}>
            <TouchableOpacity 
              style={[styles.accessCard, accessibilityFeatures.physical && styles.accessCardActive, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => toggleAccessibility('physical')}
            >
              <MapPin color={accessibilityFeatures.physical ? '#FFF' : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.physical ? '#FFF' : theme.text }]}>Física</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.accessCard, accessibilityFeatures.visual && styles.accessCardActive, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => toggleAccessibility('visual')}
            >
              <Eye color={accessibilityFeatures.visual ? '#FFF' : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.visual ? '#FFF' : theme.text }]}>Visual</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.accessCard, accessibilityFeatures.auditory && styles.accessCardActive, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => toggleAccessibility('auditory')}
            >
              <Ear color={accessibilityFeatures.auditory ? '#FFF' : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.auditory ? '#FFF' : theme.text }]}>Auditiva</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.accessCard, accessibilityFeatures.cognitive && styles.accessCardActive, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => toggleAccessibility('cognitive')}
            >
              <Brain color={accessibilityFeatures.cognitive ? '#FFF' : theme.primary} size={24} />
              <Text style={[styles.accessText, { color: accessibilityFeatures.cognitive ? '#FFF' : theme.text }]}>Cognitiva</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <MapPin color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación Geográfica</Text>
          </View>
          <View style={[styles.mapPreview, { borderColor: theme.border, height: isMapExpanded ? 300 : 150 }]}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={location}
              onRegionChangeComplete={setLocation}
            >
              <Marker coordinate={location} />
            </MapView>
            <TouchableOpacity 
              style={styles.expandMapBtn}
              onPress={() => setIsMapExpanded(!isMapExpanded)}
            >
              <Maximize2 color="#FFF" size={18} />
            </TouchableOpacity>
          </View>
          <Text style={styles.mapHint}>Mueve el mapa para ajustar el pin en la entrada principal.</Text>
        </View>

        {/* Schedule Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Clock color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios de Visita</Text>
          </View>
          
          <View style={styles.daysRow}>
            {DAYS.map(day => (
              <TouchableOpacity 
                key={day}
                onPress={() => toggleDay(day)}
                style={[styles.dayCircle, { backgroundColor: openingDays[day] ? theme.primary : theme.surface, borderColor: theme.border }]}
              >
                <Text style={[styles.dayText, { color: openingDays[day] ? '#FFF' : theme.text }]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.text }]}>Horario Partido (Mañana y Tarde)</Text>
            <Switch 
              value={formData.isSplitSchedule} 
              onValueChange={(val) => setFormData({...formData, isSplitSchedule: val})}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>

          <View style={styles.timeInputsRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>Apertura {formData.isSplitSchedule ? 'Mañana' : ''}</Text>
              <TextInput 
                style={[styles.timeInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
                value={formData.morningOpen}
                onChangeText={(text) => setFormData({...formData, morningOpen: text})}
              />
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>Cierre {formData.isSplitSchedule ? 'Mañana' : ''}</Text>
              <TextInput 
                style={[styles.timeInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
                value={formData.morningClose}
                onChangeText={(text) => setFormData({...formData, morningClose: text})}
              />
            </View>
          </View>

          {formData.isSplitSchedule && (
            <View style={styles.timeInputsRow}>
              <View style={styles.timeCol}>
                <Text style={styles.timeLabel}>Apertura Tarde</Text>
                <TextInput 
                  style={[styles.timeInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
                  value={formData.afternoonOpen}
                  onChangeText={(text) => setFormData({...formData, afternoonOpen: text})}
                />
              </View>
              <View style={styles.timeCol}>
                <Text style={styles.timeLabel}>Cierre Tarde</Text>
                <TextInput 
                  style={[styles.timeInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
                  value={formData.afternoonClose}
                  onChangeText={(text) => setFormData({...formData, afternoonClose: text})}
                />
              </View>
            </View>
          )}
        </View>

        {/* Important Notices Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Info color="#E74C3C" size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Avisos Críticos (¡Atención!)</Text>
            <TouchableOpacity onPress={addNotice} style={styles.addBtn}>
              <Plus color="#E74C3C" size={20} />
            </TouchableOpacity>
          </View>
          {formData.importantNotices.map((notice, idx) => (
            <View key={idx} style={[styles.inputContainer, { backgroundColor: 'rgba(231, 76, 60, 0.05)', borderColor: '#E74C3C', marginBottom: 10 }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Escribe el aviso..."
                value={notice}
                onChangeText={(v) => updateNotice(idx, v)}
              />
              <TouchableOpacity onPress={() => removeNotice(idx)}>
                <Trash2 color="#E74C3C" size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Seasonal Schedule Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Calendar color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios por Temporada</Text>
            <TouchableOpacity onPress={addSeason} style={styles.addBtn}>
              <Plus color={theme.primary} size={20} />
            </TouchableOpacity>
          </View>
          {formData.seasons.map((season, idx) => (
            <View key={idx} style={[styles.seasonFormCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                  style={[styles.seasonFormInput, { fontWeight: '800', color: theme.primary, flex: 1 }]}
                  placeholder="Nombre temporada (Ej: Verano)"
                  value={season.name}
                  onChangeText={(v) => updateSeason(idx, 'name', v)}
                />
                <TouchableOpacity onPress={() => removeSeason(idx)}>
                  <Trash2 color="#E74C3C" size={18} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.seasonFormInput, { color: theme.textSecondary, fontSize: 13 }]}
                placeholder="Periodo (Ej: 1 Abr - 30 Sep)"
                value={season.period}
                onChangeText={(v) => updateSeason(idx, 'period', v)}
              />
              <View style={{ marginTop: 10, gap: 8 }}>
                <View style={styles.seasonFormRow}>
                  <Text style={[styles.seasonFormLabel, { color: theme.text }]}>Lun-Sáb:</Text>
                  <TextInput
                    style={[styles.seasonFormTime, { color: theme.text, borderColor: theme.border }]}
                    placeholder="10:00 - 14:00..."
                    value={season.weekday}
                    onChangeText={(v) => updateSeason(idx, 'weekday', v)}
                  />
                </View>
                <View style={styles.seasonFormRow}>
                  <Text style={[styles.seasonFormLabel, { color: theme.text }]}>Dom/Fest:</Text>
                  <TextInput
                    style={[styles.seasonFormTime, { color: theme.text, borderColor: theme.border }]}
                    placeholder="Cerrado / Mañanas..."
                    value={season.weekend}
                    onChangeText={(v) => updateSeason(idx, 'weekend', v)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Tariffs Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <CreditCard color={theme.primary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas y Entradas</Text>
            <TouchableOpacity 
              onPress={() => setTariffs([...tariffs, { id: Date.now().toString(), label: '', price: '' }])} 
              style={styles.addBtn}
            >
              <Plus color={theme.primary} size={20} />
            </TouchableOpacity>
          </View>

          {tariffs.map((tariff) => (
            <View key={tariff.id} style={styles.tariffRow}>
              <TextInput
                style={[styles.tariffLabelInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Tipo (Ej: Adulto)"
                placeholderTextColor={theme.textSecondary}
                value={tariff.label}
                onChangeText={(text) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, label: text } : t))}
              />
              <TextInput
                style={[styles.tariffPriceInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="€"
                placeholderTextColor={theme.textSecondary}
                value={tariff.price}
                onChangeText={(text) => setTariffs(tariffs.map(t => t.id === tariff.id ? { ...t, price: text } : t))}
              />
              <TouchableOpacity onPress={() => setTariffs(tariffs.filter(t => t.id !== tariff.id))} style={styles.removeBtn}>
                <Trash2 color="#E74C3C" size={18} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 15 }]}>
            <Info color={theme.primary} size={20} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Info adicional (Ej: Gratis los domingos)"
              placeholderTextColor={theme.textSecondary}
              value={formData.freeInfo}
              onChangeText={(text) => setFormData({...formData, freeInfo: text})}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Check color="#FFF" size={24} />
              <Text style={styles.submitBtnText}>Publicar Lugar</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  aiHeaderBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  photoUpload: {
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 25,
  },
  previewImage: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoText: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  formSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginLeft: 10, flex: 1 },
  inputGroup: { gap: 0 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  categoryScroll: { marginTop: 15, paddingBottom: 5 },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryText: { fontSize: 13, fontWeight: '700' },
  accessibilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  accessCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    gap: 10
  },
  accessCardActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB'
  },
  accessText: {
    fontSize: 14,
    fontWeight: '800'
  },
  mapPreview: {
    height: 150,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  expandMapBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 10,
  },
  mapHint: { fontSize: 12, color: '#95A5A6', textAlign: 'center', fontStyle: 'italic' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 12, fontWeight: '800' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5
  },
  label: { fontSize: 14, fontWeight: '700' },
  timeInputsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  timeCol: { flex: 1 },
  timeLabel: { fontSize: 11, color: '#95A5A6', marginBottom: 5, fontWeight: '700', textTransform: 'uppercase' },
  timeInput: {
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700'
  },
  seasonFormCard: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
    gap: 5,
  },
  seasonFormInput: {
    fontSize: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  seasonFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seasonFormLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  seasonFormTime: {
    fontSize: 13,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 150,
    textAlign: 'right',
  },
  addBtn: { padding: 5 },
  tariffRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'center' },
  tariffLabelInput: { flex: 2, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, fontWeight: '600' },
  tariffPriceInput: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, textAlign: 'center', fontWeight: '700' },
  removeBtn: { padding: 10 },
  submitBtn: {
    flexDirection: 'row',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900', marginLeft: 12 },
});
