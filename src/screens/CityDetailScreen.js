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
  StatusBar
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
  X
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
      <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <Icon color={theme.primary} size={24} />
            <Text style={[styles.modalTitle, { color: theme.text }, typography.h2]}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={theme.text} size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={[styles.modalText, { color: theme.text }]}>{content}</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export function CityDetailScreen({ route, navigation }) {
  const { city } = route.params;
  const { theme, isDarkMode } = useTheme();
  const { userData } = useUser();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: '', icon: Info });

  const normalize = (text) => 
    text?.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/y/g, 'i') || '';

  // 1. Obtener monumentos oficiales
  const officialMonuments = MONUMENTOS[city.name] || [];

  // 2. Obtener contribuciones del usuario para ESTA ciudad (Normalizado)
  const userContributions = (userData?.contributions || []).filter(p => 
    normalize(p.city) === normalize(city.name) || normalize(p.name).includes(normalize(city.name))
  ).map(p => ({
    id: p.id,
    name: p.name,
    image: 'https://images.unsplash.com/photo-1544281679-5357151b483c?auto=format&fit=crop&w=800&q=80',
    description: p.freeInfo || 'Lugar añadido por la comunidad.',
    category: p.category,
    tariffs: p.tariffs,
    isUserAdded: true
  }));

  const allPlaces = [...officialMonuments, ...userContributions];

  const openInfo = (title, content, icon) => {
    setModalData({ title, content, icon });
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: city.image }} style={styles.image} />
          <View style={styles.gradientOverlay} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.cityName, typography.h1]}>{city.name}</Text>
            <View style={styles.locationContainer}>
              <MapPin color="rgba(255,255,255,0.8)" size={16} />
              <Text style={styles.locationText}>{city.province}, {city.region}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {city.description}
          </Text>

          {/* ESSENCE: Accessibility Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Accessibility color={theme.primary} size={20} />
              <Text style={[styles.statValue, { color: theme.text }]}>95%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Adaptado</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ticket color={theme.accent} size={20} />
              <Text style={[styles.statValue, { color: theme.text }]}>Gratis</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Discapacidad</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <CheckCircle color="#2ECC71" size={20} />
              <Text style={[styles.statValue, { color: theme.text }]}>{allPlaces.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Puntos</Text>
            </View>
          </View>

          {/* Information Grid */}
          <View style={styles.infoGrid}>
            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Nuestra Historia', city.history || 'Ciudad con gran riqueza cultural por descubrir.', HistoryIcon)}
            >
              <HistoryIcon color={theme.primary} size={24} />
              <Text style={[styles.infoCardText, { color: theme.text }]}>Historia</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Geografía Local', city.geography || 'Ubicación estratégica en el mapa nacional.', Globe)}
            >
              <Globe color={theme.primary} size={24} />
              <Text style={[styles.infoCardText, { color: theme.text }]}>Geografía</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Climatología', city.climate || 'Clima mediterráneo variable según la estación.', Cloud)}
            >
              <Cloud color={theme.primary} size={24} />
              <Text style={[styles.infoCardText, { color: theme.text }]}>Clima</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => openInfo('Entorno y Paisaje', city.landscape || 'Entorno natural privilegiado con rutas accesibles.', Mountain)}
            >
              <Mountain color={theme.primary} size={24} />
              <Text style={[styles.infoCardText, { color: theme.text }]}>Paisaje</Text>
            </TouchableOpacity>
          </View>

          {/* ESSENCE: Monuments List with Discount Emphasis */}
          <View style={styles.monumentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }, typography.h2]}>Lugares y Monumentos</Text>
            {allPlaces.map((place) => (
              <TouchableOpacity 
                key={place.id} 
                style={[styles.monumentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => navigation.navigate('PlaceDetail', { place })}
              >
                <Image source={{ uri: place.image }} style={styles.monumentImage} />
                <View style={styles.monumentInfo}>
                  <View style={styles.monumentHeader}>
                    <Text style={[styles.monumentName, { color: theme.text }]}>{place.name}</Text>
                    <View style={[styles.benefitTag, { backgroundColor: place.isUserAdded ? theme.accent : theme.primary }]}>
                      <Ticket color="#FFFFFF" size={12} />
                      <Text style={styles.benefitText}>{place.isUserAdded ? 'COMUNIDAD' : 'OFICIAL'}</Text>
                    </View>
                  </View>
                  <View style={styles.accessRow}>
                    <Accessibility color={theme.primary} size={14} />
                    <Text style={[styles.accessText, { color: theme.textSecondary }]}>
                      {place.category || 'Punto de Interés'}
                    </Text>
                  </View>
                  <Text style={[styles.monumentDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                    {place.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 100 }} />
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
  container: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.45,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  cityName: {
    color: '#FFFFFF',
    fontSize: 36,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 6,
  },
  content: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
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
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  infoCardText: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 14,
  },
  monumentsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  monumentCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  monumentImage: {
    width: '100%',
    height: 180,
  },
  monumentInfo: {
    padding: 16,
  },
  monumentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  monumentName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  benefitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 4,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accessText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  monumentDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    marginLeft: 12,
  },
  modalBody: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 26,
  },
  closeButton: {
    padding: 5,
  },
});
