import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal, 
  Image, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Camera, 
  RotateCw, 
  Maximize, 
  X, 
  Check,
  Calendar,
  Map,
  Globe,
  CreditCard,
  Zap
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography } from '../theme/typography';

const EU_COUNTRIES = [
  { name: 'España', code: 'ES', prefix: '+34' },
  { name: 'Francia', code: 'FR', prefix: '+33' },
  { name: 'Italia', code: 'IT', prefix: '+39' },
  { name: 'Alemania', code: 'DE', prefix: '+49' },
  { name: 'Portugal', code: 'PT', prefix: '+351' },
  { name: 'Bélgica', code: 'BE', prefix: '+32' },
  { name: 'Holanda', code: 'NL', prefix: '+31' },
  { name: 'Irlanda', code: 'IE', prefix: '+353' },
  { name: 'Austria', code: 'AT', prefix: '+43' },
  { name: 'Grecia', code: 'GR', prefix: '+30' },
  { name: 'Suecia', code: 'SE', prefix: '+46' },
  { name: 'Dinamarca', code: 'DK', prefix: '+45' },
  { name: 'Finlandia', code: 'FI', prefix: '+358' },
  { name: 'Polonia', code: 'PL', prefix: '+48' },
  { name: 'República Checa', code: 'CZ', prefix: '+420' },
  { name: 'Rumanía', code: 'RO', prefix: '+40' },
  { name: 'Bulgaria', code: 'BG', prefix: '+359' },
  { name: 'Hungría', code: 'HU', prefix: '+36' },
];

const InputField = ({ label, value, icon: Icon, onChangeText, keyboardType, theme, actionIcon: ActionIcon, onActionPress, isLoading, prefix, onPrefixPress }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Icon color={theme.primary} size={20} />
      
      {prefix !== undefined && (
        <TouchableOpacity 
          style={[styles.prefixSelector, { borderRightColor: theme.border }]}
          onPress={onPrefixPress}
        >
          <Text style={[styles.prefixText, { color: theme.text }]}>{prefix || '+34'}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 10 }}>▼</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={[styles.input, { color: theme.text, marginLeft: prefix ? 10 : 15 }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
      />
      {ActionIcon && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onActionPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ActionIcon color={theme.primary} size={20} />
          )}
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export function EditProfileScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData, persistImage } = useUser();
  
  // Usamos el estado local para la edición fluida
  const [localData, setLocalData] = useState({ ...userData });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [tempImage, setTempImage] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const handleCountrySelect = (country) => {
    setLocalData(prev => ({ 
      ...prev, 
      country: country.name, 
      phonePrefix: country.prefix 
    }));
    setCountryModalVisible(false);
  };

  const handleGeolocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación para detectar tu dirección.');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverse.length > 0) {
        const addr = reverse[0];
        const formattedAddr = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.postalCode || ''}`.trim().replace(/^ ,/, '').replace(/, ,/g, ',');
        setLocalData(prev => ({ ...prev, address: formattedAddr }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleImageOption = () => {
    Alert.alert(
      'Foto de Perfil',
      'Selecciona el origen de la imagen',
      [
        { text: 'Cámara', onPress: () => pickImage(true) },
        { text: 'Galería', onPress: () => pickImage(false) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (useCamera) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso denegado', 'Se requiere acceso para cambiar la foto.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ 
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8 
        });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
      setRotation(0);
      setScale(1);
      setEditModalVisible(true);
    }
  };

  const saveEditedImage = () => {
    setLocalData(prev => ({ ...prev, profileImage: tempImage }));
    setEditModalVisible(false);
  };

  const handleSave = async () => {
    try {
      let finalData = { ...localData };
      if (localData.profileImage && localData.profileImage.startsWith('file://') && localData.profileImage !== userData.profileImage) {
        const permanentUri = await persistImage(localData.profileImage, `profile_${userData.id || 'user'}`);
        finalData.profileImage = permanentUri;
      }
      updateUserData(finalData);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron guardar los cambios correctamente.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Mis Datos v3.0.2</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="always"
        >
          {/* Avatar Edit Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              style={[styles.avatarWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handleImageOption}
            >
              {localData.profileImage ? (
                <Image source={{ uri: localData.profileImage }} style={styles.avatarImg} />
              ) : (
                <User color={theme.primary} size={40} />
              )}
              <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                <Camera color="#FFFFFF" size={14} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarLabel, { color: theme.textSecondary }]}>Toca para cambiar foto</Text>
          </View>
          <InputField 
            label="Nombre" 
            value={localData.name} 
            icon={User}
            theme={theme}
            onChangeText={(text) => setLocalData(prev => ({...prev, name: text}))}
          />
          <InputField 
            label="Apellido(s)" 
            value={localData.lastName} 
            icon={User}
            theme={theme}
            onChangeText={(text) => setLocalData(prev => ({...prev, lastName: text}))}
          />
          
          <TouchableOpacity 
            style={styles.inputContainer} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha de Nacimiento</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Calendar color={theme.primary} size={20} />
              <Text style={[styles.input, { color: localData.birthDate ? theme.text : theme.textSecondary, lineHeight: 24, paddingTop: 14 }]}>
                {localData.birthDate || 'Seleccionar fecha'}
              </Text>
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={localData.birthDate ? new Date(localData.birthDate.split('/').reverse().join('-')) : new Date(1990, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const day = selectedDate.getDate().toString().padStart(2, '0');
                  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                  const year = selectedDate.getFullYear();
                  setLocalData(prev => ({ ...prev, birthDate: `${day}/${month}/${year}` }));
                }
              }}
            />
          )}

          <InputField 
            label="Correo Electrónico" 
            value={localData.email} 
            icon={Mail}
            theme={theme}
            keyboardType="email-address"
            onChangeText={(text) => setLocalData(prev => ({...prev, email: text}))}
          />

          <TouchableOpacity 
            style={styles.inputContainer} 
            onPress={() => setCountryModalVisible(true)}
          >
            <Text style={[styles.label, { color: theme.textSecondary }]}>País (Código Europeo)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Globe color={theme.primary} size={20} />
              <Text style={[styles.input, { color: theme.text, lineHeight: 24, paddingTop: 14 }]}>
                {localData.country || 'Seleccionar país'}
              </Text>
              <Text style={{ color: theme.textSecondary, marginRight: 10 }}>▼</Text>
            </View>
          </TouchableOpacity>

          <InputField 
            label="Teléfono de Contacto" 
            value={localData.phone} 
            icon={Phone}
            theme={theme}
            keyboardType="phone-pad"
            prefix={localData.phonePrefix}
            onPrefixPress={() => setCountryModalVisible(true)}
            onChangeText={(text) => setLocalData(prev => ({...prev, phone: text}))}
          />
          <InputField 
            label="Dirección Habitual" 
            value={localData.address} 
            icon={MapPin}
            theme={theme}
            actionIcon={Map}
            onActionPress={handleGeolocation}
            isLoading={isLocating}
            onChangeText={(text) => setLocalData(prev => ({...prev, address: text}))}
          />
          <InputField 
            label="Número de Tarjeta (EDC)" 
            value={localData.cardNumber} 
            icon={CreditCard}
            theme={theme}
            placeholder="ES-XXXXXXXXX"
            onChangeText={(text) => setLocalData(prev => ({...prev, cardNumber: text.toUpperCase()}))}
          />

          {userData.isAdmin && (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.adminSectionTitle, { color: '#E67E22' }]}>ADMINISTRACIÓN IA (GEMINI)</Text>
              <InputField 
                label="API Key de Google Gemini" 
                value={localData.aiApiKey} 
                icon={Zap}
                theme={theme}
                placeholder="Ingresa tu API Key para potencia extra"
                onChangeText={(text) => setLocalData(prev => ({...prev, aiApiKey: text}))}
              />
              <Text style={{ color: theme.textSecondary, fontSize: 11, fontStyle: 'italic', marginTop: -15, marginLeft: 5 }}>
                * Esta clave activa modelos de lenguaje más potentes en la generación de guías.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Save color="#070B14" size={20} />
            <Text style={[styles.saveButtonText, { color: '#070B14' }]}>Guardar Cambios</Text>
          </TouchableOpacity>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Edición de Foto de Perfil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.editModalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.editHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X color={theme.text} size={28} />
            </TouchableOpacity>
            <Text style={[styles.editTitle, { color: theme.text }, typography.h2]}>Ajustar Foto</Text>
            <TouchableOpacity onPress={saveEditedImage}>
              <Check color={theme.primary} size={28} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            <View style={[styles.previewWrapper, { borderColor: theme.border, overflow: 'hidden', borderRadius: 150 }]}>
              <Image 
                source={{ uri: tempImage }} 
                style={[
                  styles.previewImage, 
                  { 
                    transform: [
                      { rotate: `${rotation}deg` },
                      { scale: scale }
                    ] 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.controlsContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.controlRow}>
              <TouchableOpacity 
                style={[styles.controlBtn, { backgroundColor: theme.background }]}
                onPress={() => setRotation(prev => prev - 90)}
              >
                <RotateCw size={24} color={theme.primary} style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={[styles.controlText, { color: theme.text }]}>Girar Izq.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtn, { backgroundColor: theme.background }]}
                onPress={() => setRotation(prev => prev + 90)}
              >
                <RotateCw size={24} color={theme.primary} />
                <Text style={[styles.controlText, { color: theme.text }]}>Girar Der.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtn, { backgroundColor: theme.background }]}
                onPress={() => setScale(prev => Math.min(prev + 0.2, 3))}
              >
                <Maximize size={24} color={theme.primary} />
                <Text style={[styles.controlText, { color: theme.text }]}>Zoom +</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtn, { backgroundColor: theme.background }]}
                onPress={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
              >
                <Maximize size={24} color={theme.primary} style={{ transform: [{ scale: 0.7 }] }} />
                <Text style={[styles.controlText, { color: theme.text }]}>Zoom -</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Selección de País */}
      <Modal
        visible={countryModalVisible}
        animationType="fade"
        transparent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setCountryModalVisible(false)}
        >
          <View style={[styles.countryModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.countryModalHeader}>
              <Text style={[styles.countryModalTitle, { color: theme.text }]}>Selecciona tu País</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <X color={theme.text} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {EU_COUNTRIES.map((country) => (
                <TouchableOpacity 
                  key={country.code} 
                  style={[
                    styles.countryItem, 
                    { borderBottomColor: theme.border },
                    localData.country === country.name && { backgroundColor: theme.primary + '10' }
                  ]}
                  onPress={() => handleCountrySelect(country)}
                >
                  <View style={styles.countryItemRow}>
                    <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
                    <Text style={[styles.countryPrefix, { color: theme.primary }]}>{country.prefix}</Text>
                  </View>
                  {localData.country === country.name && <Check color={theme.primary} size={18} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    paddingVertical: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#070B14',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  editModalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  editTitle: {
    fontSize: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewWrapper: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  controlsContainer: {
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlBtn: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    width: 80,
  },
  controlText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },
  prefixSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 5,
    borderRightWidth: 1,
    height: '60%',
    gap: 5,
    marginLeft: 10,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  countryModal: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 25,
    borderWidth: 1,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  countryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
  },
  countryModalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderRadius: 12,
  },
  countryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  countryPrefix: {
    fontSize: 14,
    fontWeight: '800',
    opacity: 0.8,
  },
});
