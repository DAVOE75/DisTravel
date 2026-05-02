import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import * as ImagePicker from 'expo-image-picker';
import { 
  User, 
  ChevronRight, 
  ShieldCheck, 
  HelpCircle, 
  LogOut,
  Camera,
  Accessibility,
  CheckCircle,
  FileText,
  Settings,
  RotateCw,
  Maximize,
  X,
  Check,
  Edit,
  ChevronLeft,
  Star,
  Users
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const ProfileItem = ({ icon: Icon, title, value, onPress, isLast, color, theme }) => (
  <TouchableOpacity 
    style={[styles.item, { borderBottomColor: theme.border }, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
  >
    <View style={styles.itemLeft}>
      <View style={[styles.iconContainer, { backgroundColor: (color || theme.primary) + '15' }]}>
        <Icon color={color || theme.primary} size={20} />
      </View>
      <View>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        {value && <Text style={[styles.itemValue, { color: theme.textSecondary }]}>{value}</Text>}
      </View>
    </View>
    <ChevronRight color={theme.textSecondary} size={20} />
  </TouchableOpacity>
);

export function ProfileScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData, logout } = useUser();
  const insets = useSafeAreaInsets();

  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const [tempImage, setTempImage] = React.useState(null);

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
    updateUserData({ profileImage: tempImage });
    setEditModalVisible(false);
    Alert.alert('¡Hecho!', 'Tu foto de perfil se ha actualizado correctamente.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header with Settings */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }, typography.h2]}>Perfil</Text>
        <TouchableOpacity 
          style={[styles.settingsBtn, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Settings color={theme.text} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              style={[styles.avatar, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleImageOption}
            >
              {userData?.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatarImg} />
              ) : (
                <User color={theme.primary} size={50} />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cameraButton, { backgroundColor: theme.primary }]}
              onPress={handleImageOption}
            >
              <Camera color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }, typography.h1]}>{userData?.name || 'Viajero'}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{userData?.email || 'viajero@distravel.com'}</Text>
          {userData?.phone && (
            <Text style={[styles.userPhone, { color: theme.primary }]}>{userData.phone}</Text>
          )}
        </View>

        {/* Disability Card Preview Section */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Tarjeta de Discapacidad</Text>
            <View style={styles.verifiedBadge}>
              <CheckCircle color={theme.success} size={14} />
              <Text style={[styles.verifiedText, { color: theme.success }]}>Verificada</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.idCardContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('DisabilityDetail')}
          >
            <Image 
              source={{ uri: userData?.idCardImage }} 
              style={styles.idCardImage}
              blurRadius={1}
            />
            <View style={styles.cardOverlay}>
              <FileText color="#FFFFFF" size={32} />
              <Text style={styles.cardOverlayText}>Toca para gestionar credencial</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats / Badges / Gamification */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Star color="#F1C40F" size={24} />
            <Text style={[styles.statValue, { color: theme.text }]}>{userData?.points || '150'}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Puntos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Users color={theme.accent} size={24} />
            <Text style={[styles.statValue, { color: theme.text }]}>{userData?.impact || '24'}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ayudados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ShieldCheck color={theme.success} size={24} />
            <Text style={[styles.statValue, { color: theme.text }]}>Oro</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Nivel</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Configuración de Cuenta</Text>
          <View style={[styles.menuList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ProfileItem 
              icon={User} 
              title="Mi Perfil" 
              value="Datos personales y contacto"
              theme={theme}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <ProfileItem 
              icon={Accessibility} 
              title="Grado de Discapacidad" 
              value="Ver detalles técnicos y caducidad"
              theme={theme}
              onPress={() => navigation.navigate('DisabilityDetail')}
            />
            <ProfileItem 
              icon={Edit} 
              title="Editar Acreditación" 
              value="Modificar grado, organismo o fechas"
              theme={theme}
              onPress={() => navigation.navigate('DisabilityDetail', { editMode: true })}
            />
            <ProfileItem 
              icon={Settings} 
              title="Ajustes de App" 
              value="Idioma, notificaciones y tema"
              isLast={true}
              theme={theme}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Cerrar Sesión',
              '¿Estás seguro de que quieres salir?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sí, salir', style: 'destructive', onPress: logout },
              ]
            );
          }}
        >
          <LogOut color="#E74C3C" size={20} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topTitle: {
    fontSize: 20,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  cardSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  idCardContainer: {
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  idCardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 8,
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    width: '31%',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuList: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 11,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: '#E74C3C',
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
