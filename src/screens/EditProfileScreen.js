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
  Platform
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
  Map
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Modal, Image, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { typography } from '../theme/typography';

const InputField = ({ label, value, icon: Icon, onChangeText, keyboardType, theme, actionIcon: ActionIcon, onActionPress, isLoading }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Icon color={theme.primary} size={20} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
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
  const { userData, updateUserData } = useUser();
  
  // Usamos el estado local para la edición fluida
  const [localData, setLocalData] = useState({ ...userData });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [tempImage, setTempImage] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

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

  const handleSave = () => {
    updateUserData(localData);
    navigation.goBack();
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
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Mis Datos</Text>
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
            label="Nombre Completo" 
            value={localData.name} 
            icon={User}
            theme={theme}
            onChangeText={(text) => setLocalData(prev => ({...prev, name: text}))}
          />
          <InputField 
            label="Correo Electrónico" 
            value={localData.email} 
            icon={Mail}
            theme={theme}
            keyboardType="email-address"
            onChangeText={(text) => setLocalData(prev => ({...prev, email: text}))}
          />
          <InputField 
            label="Teléfono de Contacto" 
            value={localData.phone} 
            icon={Phone}
            theme={theme}
            keyboardType="phone-pad"
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

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Save color="#FFFFFF" size={20} />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
    color: '#FFFFFF',
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
});
