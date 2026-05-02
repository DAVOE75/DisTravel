import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Info, 
  Accessibility, 
  Ticket,
  Cloud,
  History as HistoryIcon,
  Globe,
  Mountain,
  CheckCircle,
  X,
  Edit
} from 'lucide-react-native';
import { MONUMENTOS } from '../data/monumentos';
import { typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');

const InfoModal = ({ visible, onClose, title, content, theme, icon: Icon }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <View style={[styles.modalIconBox, { backgroundColor: theme.primary + '20' }]}>
              <Icon color={theme.primary} size={24} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }, typography.h2]}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={theme.text} size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>{content}</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export function CityDetailScreen({ route, navigation }) {
  const { city } = route.params;
  const { theme } = useTheme();
  const { userData, updateUserData } = useUser();
  const isAdmin = userData?.isAdmin || false;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: '', icon: Info });
  const [tempCityData, setTempCityData] = useState(city);

  const normalize = (text) => 
    text?.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i') || '';

  const officialPlaces = MONUMENTOS[city.name] || [];

  const userContributions = (userData?.contributions || []).filter(p => 
    normalize(p.city) === normalize(city.name) || normalize(p.name).includes(normalize(city.name))
  ).map(p => ({
    ...p,
    description: p.freeInfo || 'Lugar añadido por la comunidad.',
    category: p.category,
    tariffs: p.tariffs,
    isUserAdded: true,
    verified: p.verified || false,
    userId: p.userId
  }));

  const allPlaces = [
    ...officialPlaces,
    ...userContributions.filter(p => 
      isAdmin || p.verified || p.userId === userData.id
    )
  ];

  const handleValidate = async (placeId) => {
    const updatedContributions = userData.contributions.map(p => 
      p.id === placeId ? { ...p, verified: true } : p
    );
    await updateUserData({ contributions: updatedContributions });
    Alert.alert("¡Validado!", "El lugar ahora es visible para todos los usuarios.");
  };

  const openInfo = (title, content, icon) => {
    setModalData({ title, content, icon });
    setModalVisible(true);
  };

  const handleAdminEdit = (section) => {
    Alert.alert(
      "Modo Administrador",
      `¿Deseas editar la sección de ${section}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Editar", onPress: () => console.log("Editar", section) }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: tempCityData.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a' }} 
            style={styles.headerImage} 
          />
          <View style={styles.headerOverlay} />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={[styles.cityName, { color: '#FFFFFF' }, typography.h1]}>
              {tempCityData.name}
            </Text>
            <View style={styles.locationRow}>
              <MapPin color="#FFFFFF" size={16} />
              <Text style={styles.locationText}>España, {tempCityData.province || 'Alicante'}</Text>
            </View>
          </View>

          {isAdmin && (
            <TouchableOpacity 
              style={styles.adminEditHeader}
              onPress={() => handleAdminEdit('Cabecera')}
            >
              <Edit color="#FFF" size={20} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mainContent}>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {tempCityData.description || 'Explora los lugares accesibles de este municipio y descubre su riqueza cultural.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Accessibility color={theme.primary} size={22} />
              <Text style={[styles.statValue, { color: theme.text }]}>95%</Text>
              <Text style={styles.statLabel}>Adaptado</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ticket color="#F1C40F" size={22} />
              <Text style={[styles.statValue, { color: theme.text }]}>Gratis</Text>
              <Text style={styles.statLabel}>Discapacidad</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <CheckCircle color="#2ECC71" size={22} />
              <Text style={[styles.statValue, { color: theme.text }]}>{allPlaces.length}</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Nuestra Historia', city.history || 'Ciudad con gran riqueza cultural por descubrir.', HistoryIcon)}
              onLongPress={() => isAdmin && handleAdminEdit('Historia')}
            >
              <HistoryIcon color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Historia</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Geografía Local', city.geography || 'Ubicación estratégica en el mapa nacional.', Globe)}
              onLongPress={() => isAdmin && handleAdminEdit('Geografía')}
            >
              <Globe color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Geografía</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Climatología', city.climate || 'Clima mediterráneo variable según la estación.', Cloud)}
              onLongPress={() => isAdmin && handleAdminEdit('Clima')}
            >
              <Cloud color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Clima</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Entorno y Paisaje', city.landscape || 'Entorno natural privilegiado con rutas accesibles.', Mountain)}
              onLongPress={() => isAdmin && handleAdminEdit('Paisaje')}
            >
              <Mountain color={theme.primary} size={24} />
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>Paisaje</Text>
              {isAdmin && <View style={styles.adminDot} />}
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }, typography.h2]}>
            Lugares y Monumentos
          </Text>

          {allPlaces.map((place) => (
            <TouchableOpacity 
              key={place.id} 
              style={[styles.placeItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => !place.isUserAdded && navigation.navigate('PlaceDetail', { place })}
            >
              <View style={styles.placeHeader}>
                <View style={styles.placeInfo}>
                  <Text style={[styles.placeName, { color: theme.text }]}>{place.name}</Text>
                  <View style={styles.placeMeta}>
                    <Text style={[styles.placeCategory, { color: theme.primary }]}>{place.category || 'Monumento'}</Text>
                    {place.isUserAdded && (
                      <View style={[styles.communityBadge, { backgroundColor: place.verified ? '#2ECC7120' : '#FF950020' }]}>
                        <Text style={[styles.communityText, { color: place.verified ? '#2ECC71' : '#FF9500' }]}>
                          {place.verified ? 'VERIFICADO' : 'PENDIENTE'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {isAdmin && place.isUserAdded && !place.verified && (
                  <TouchableOpacity 
                    style={[styles.validateBtn, { backgroundColor: '#2ECC71' }]}
                    onPress={() => handleValidate(place.id)}
                  >
                    <CheckCircle color="#FFF" size={18} />
                    <Text style={styles.validateBtnText}>Validar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <InfoModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalData.title}
        content={modalData.content}
        icon={modalData.icon}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImageContainer: { height: 320, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  headerContent: { position: 'absolute', bottom: 40, left: 20 },
  cityName: { fontSize: 36, fontWeight: '900', marginBottom: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: 'rgba(255,255,255,0.9)', marginLeft: 6, fontSize: 16, fontWeight: '600' },
  adminEditHeader: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  mainContent: { padding: 20, paddingTop: 30 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 30 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  statCard: { width: '30%', padding: 16, borderRadius: 24, alignItems: 'center', borderWidth: 1, elevation: 2, shadowOpacity: 0.05 },
  statValue: { fontSize: 20, fontWeight: '900', marginVertical: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 35 },
  infoCard: { width: '48%', padding: 22, borderRadius: 24, alignItems: 'center', marginBottom: 15, borderWidth: 1, position: 'relative' },
  infoCardTitle: { marginTop: 12, fontSize: 15, fontWeight: '700' },
  adminDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' },
  sectionTitle: { fontSize: 22, marginBottom: 20, fontWeight: '900' },
  placeItem: { padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1 },
  placeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  placeMeta: { flexDirection: 'row', alignItems: 'center' },
  placeCategory: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  communityBadge: { marginLeft: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  communityText: { fontSize: 10, fontWeight: '900' },
  validateBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 14 },
  validateBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { height: '70%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { marginLeft: 15, flex: 1 },
  modalBody: { flex: 1 },
  modalText: { fontSize: 16, lineHeight: 28 },
  closeButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' }
});
