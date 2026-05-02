import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AccessibilitySpecs } from '../components/AccessibilitySpecs';
import { ScheduleView } from '../components/ScheduleView';
import { DisabilityPriceCard } from '../components/DisabilityPriceCard';
import { DiscountsList } from '../components/DiscountsList';
import { getProfile } from '../services/storage';
import { ChevronLeft, Share2, Heart, MapPin, CheckCircle2, Info } from 'lucide-react-native';

export function PlaceDetailScreen({ route, navigation }) {
  const { place, city, name, location, image, description } = route.params || {};
  const [userProfile, setUserProfile] = React.useState(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile();
      setUserProfile(profile);
    };
    loadProfile();
  }, []);
  
  const placeData = place || {
    name: name || city?.name || 'Lugar',
    location: location || city?.country || 'Ubicación',
    image: image || city?.image,
    description: description || 'Descubra la belleza y la historia de este emblemático lugar, ahora con acceso adaptado para todos.',
    basePrice: 15,
    discount33: 10,
    discount65: 0,
    hasCompanion: true,
    accessibility: {
      wheelchair: true,
      elevator: true,
      audioGuide: true,
      adaptedWC: true,
      braille: false,
      parking: true
    },
    schedule: {
      lunes: '09:00 - 18:00',
      martes: '09:00 - 18:00',
      miercoles: '09:00 - 18:00',
      jueves: '09:00 - 18:00',
      viernes: '09:00 - 18:00',
      sabado: '09:00 - 18:00',
      domingo: '09:00 - 18:00'
    }
  };

  // Determine applicable price based on user profile
  let appliedPrice = placeData.basePrice;
  let appliedLabel = 'Precio General';
  let showCompanion = false;

  if (userProfile) {
    if (userProfile.degree >= 65) {
      appliedPrice = placeData.discount65;
      appliedLabel = `Tu Tarifa (Grado ${userProfile.degree}%)`;
      showCompanion = placeData.hasCompanion;
    } else if (userProfile.degree >= 33) {
      appliedPrice = placeData.discount33;
      appliedLabel = `Tu Tarifa (Grado ${userProfile.degree}%)`;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { marginLeft: 12 }]}>
            <Heart color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounceless={true}>
        <Image 
          source={{ uri: placeData.image }} 
          style={styles.mainImage}
        />
        
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, typography.h1]}>{placeData.name}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={colors.primary} />
              <Text style={[styles.location, typography.body]}>{placeData.location}</Text>
            </View>
          </View>

          {userProfile?.cardImage && (
            <View style={styles.cardStatus}>
              <CheckCircle2 color={colors.success} size={16} />
              <Text style={styles.cardStatusText}>Acreditación digital lista para presentar</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, typography.h3]}>Tarifas e Inclusión</Text>
          <DisabilityPriceCard 
            label={appliedLabel} 
            price={appliedPrice === 0 ? 'Gratis' : `${appliedPrice}€`}
            hasCompanion={showCompanion}
          />
          <DiscountsList 
            basePrice={placeData.basePrice}
            discount33={placeData.discount33}
            discount65={placeData.discount65}
          />

          <Text style={[styles.sectionTitle, typography.h3, { marginTop: 32 }]}>Descripción</Text>
          <Text style={styles.description}>
            {placeData.description}
          </Text>

          <Text style={[styles.sectionTitle, typography.h3, { marginTop: 16 }]}>Accesibilidad Técnica</Text>
          <AccessibilitySpecs specs={placeData.accessibility} />

          <ScheduleView schedule={placeData.schedule} />

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Planear Visita</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRight: {
    flexDirection: 'row',
  },
  mainImage: {
    width: '100%',
    height: 350,
  },
  content: {
    marginTop: -30,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleSection: {
    marginBottom: 24,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  cardStatusText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    color: colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: colors.textSecondary,
    marginLeft: 6,
  },
  sectionTitle: {
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: 18,
  },
});
