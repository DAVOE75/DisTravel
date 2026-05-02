import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import * as ImagePicker from 'expo-image-picker';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Hash, 
  Accessibility,
  Download,
  Camera,
  Save,
  Edit,
  X
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const EditableField = ({ label, value, onChangeText, icon: Icon, theme, isEditing, color }) => (
  <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
    <View style={[styles.iconBox, { backgroundColor: (color || theme.primary) + '15' }]}>
      <Icon color={color || theme.primary} size={20} />
    </View>
    <View style={styles.detailText}>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, { color: theme.text, borderBottomColor: theme.primary }]}
          value={String(value)}
          onChangeText={onChangeText}
          placeholder="Escribir..."
          placeholderTextColor={theme.textSecondary}
        />
      ) : (
        <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
      )}
    </View>
  </View>
);

export function DisabilityDetailScreen({ navigation, route }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData } = useUser();
  const [isEditing, setIsEditing] = useState(route.params?.editMode || false);
  const [localData, setLocalData] = useState({ ...userData });
  const [rotation, setRotation] = useState(0);

  React.useEffect(() => {
    if (route.params?.editMode) {
      setIsEditing(true);
    }
  }, [route.params]);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleImageOption = () => {
    Alert.alert(
      "Actualizar Tarjeta",
      "¿Cómo deseas añadir la foto de tu tarjeta de discapacidad?",
      [
        {
          text: "Hacer Foto con Cámara",
          onPress: takePhoto,
        },
        {
          text: "Elegir de Galería",
          onPress: pickImage,
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para poder fotografiar la tarjeta.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLocalData({ ...localData, idCardImage: result.assets[0].uri });
      setRotation(0); // Reset rotation on new photo
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLocalData({ ...localData, idCardImage: result.assets[0].uri });
      setRotation(0); // Reset rotation on new photo
    }
  };

  const handleSave = () => {
    updateUserData(localData);
    setIsEditing(false);
    Alert.alert("Éxito", "Tus datos de acreditación han sido actualizados.");
  };

  const handleCancel = () => {
    setLocalData({ ...userData });
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Full Screen Presentation Modal */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <TouchableOpacity 
          style={styles.fullImageContainer} 
          activeOpacity={1} 
          onPress={() => setShowFullImage(false)}
        >
          <View style={styles.fullImageHeader}>
            <TouchableOpacity onPress={() => setShowFullImage(false)}>
              <X color="#FFFFFF" size={32} />
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: localData.idCardImage }} 
            style={[
              styles.fullIdCardImage,
              { transform: [{ rotate: `${rotation}deg` }] }
            ]}
            resizeMode="contain"
          />
          <Text style={styles.presentationText}>MODO PRESENTACIÓN OFICIAL</Text>
        </TouchableOpacity>
      </Modal>

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
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>
            {isEditing ? 'Editar Datos' : 'Acreditación'}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {!isEditing ? (
              <TouchableOpacity style={styles.actionIconButton} onPress={() => setIsEditing(true)}>
                <Edit color={theme.primary} size={22} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionIconButton} onPress={handleCancel}>
                <X color="#E74C3C" size={22} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Card Visualization with Upload & Transform option */}
          <TouchableOpacity 
            style={[styles.imageContainer, { borderColor: isEditing ? theme.primary : theme.border }]}
            onPress={() => !isEditing && setShowFullImage(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <Image 
              source={{ uri: localData.idCardImage }} 
              style={[
                styles.idCardImage, 
                isEditing && { opacity: 0.6 },
                { transform: [{ rotate: `${rotation}deg` }] }
              ]}
              resizeMode="contain"
            />
            {!isEditing ? (
              <View style={styles.statusBadge}>
                <ShieldCheck color="#FFFFFF" size={14} />
                <Text style={styles.statusText}>VERIFICADO</Text>
              </View>
            ) : (
              <View style={styles.uploadOverlay}>
                <TouchableOpacity style={styles.mainUploadBtn} onPress={handleImageOption}>
                  <Camera color="#FFFFFF" size={40} />
                  <Text style={styles.uploadText}>Cambiar Foto</Text>
                </TouchableOpacity>
                
                <View style={styles.transformTools}>
                  <TouchableOpacity style={styles.toolBtn} onPress={rotateImage}>
                    <Download color="#FFFFFF" size={20} style={{ transform: [{ rotate: '90deg' }] }} />
                    <Text style={styles.toolBtnText}>Girar 90°</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Detalles Técnicos</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <EditableField 
                label="Grado de Discapacidad (%)" 
                value={localData.disabilityDegree} 
                onChangeText={(text) => setLocalData({...localData, disabilityDegree: text})}
                icon={Accessibility} 
                theme={theme}
                isEditing={isEditing}
                color={theme.success}
              />
              <EditableField 
                label="Organismo Emisor" 
                value={localData.issuingBody} 
                onChangeText={(text) => setLocalData({...localData, issuingBody: text})}
                icon={Building2} 
                theme={theme}
                isEditing={isEditing}
              />
              <EditableField 
                label="Fecha de Caducidad" 
                value={localData.expiryDate} 
                onChangeText={(text) => setLocalData({...localData, expiryDate: text})}
                icon={Calendar} 
                theme={theme}
                isEditing={isEditing}
                color="#E74C3C"
              />
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Save color="#FFFFFF" size={20} />
              <Text style={styles.saveButtonText}>Guardar Acreditación</Text>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <View style={styles.notice}>
              <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
                Los datos técnicos mostrados son esenciales para el cálculo de tus beneficios y accesibilidad en monumentos.
              </Text>
            </View>
          )}
          
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
  fullImageContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageHeader: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullIdCardImage: {
    width: '95%',
    height: '70%',
  },
  presentationText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    position: 'absolute',
    bottom: 40,
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
  actionIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    position: 'relative',
    backgroundColor: '#000',
  },
  idCardImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainUploadBtn: {
    alignItems: 'center',
    marginBottom: 20,
  },
  transformTools: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 15,
    width: '80%',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toolBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 12,
  },
  uploadText: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 10,
    fontSize: 14,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 10,
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
  notice: {
    marginTop: 10,
    padding: 10,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
});
