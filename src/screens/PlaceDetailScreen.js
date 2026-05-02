import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar,
  Linking,
  Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  Clock, 
  CreditCard, 
  Accessibility, 
  MapPin, 
  Info,
  ExternalLink,
  Navigation,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react-native';
import { typography } from '../theme/typography';

export function PlaceDetailScreen({ route, navigation }) {
  const { place } = route.params;
  const { theme, isDarkMode } = useTheme();

  const openInMaps = () => {
    if (!place.location) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${place.location.latitude},${place.location.longitude}`;
    const label = place.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
  };

  // Fallbacks for community added places
  const image = place.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a';
  const category = place.category || 'Lugar';
  const description = place.description || place.freeInfo || 'No hay descripción disponible.';
  const verifiedStatus = place.verified ? 'Verificado' : (place.verifiedByCommunity?.status || 'Comunidad');
  const lastCheck = place.verifiedByCommunity?.lastCheck || 'Reciente';
  
  const technicalSpecs = place.technicalSpecs || {
    doorWidth: 'N/A',
    turningSpace: 'N/A',
    magneticLoop: 'N/A',
    brailleSignage: 'N/A'
  };

  const price = place.price || (place.tariffs ? `${place.tariffs[0]?.price || '0'}€` : 'Consultar');
  const disabilityBenefit = place.disabilityBenefit || place.freeInfo || 'Consultar en taquilla';
  const schedule = place.schedule || (place.morningOpen ? `${place.morningOpen} - ${place.morningClose}` : 'Consultar horario');
  const accessibility = place.accessibility || 'Información de accesibilidad pendiente de verificar.';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: image }} style={styles.heroImage} />
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.circleButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.heroContent}>
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
          </View>
          <Text style={[styles.placeName, typography.h1]}>{place.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Info Bar */}
        <View style={[styles.infoBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.infoItem}>
            <Clock color={theme.primary} size={20} />
            <Text style={[styles.infoText, { color: theme.text }]}>Horario</Text>
          </View>
          <View style={styles.infoDivider} />
          <TouchableOpacity style={styles.infoItem} onPress={openInMaps}>
            <Navigation color={theme.primary} size={20} />
            <Text style={[styles.infoText, { color: theme.text }]}>Cómo llegar</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Description */}
        <View style={styles.section}>
          <View style={[styles.verifiedBadge, { backgroundColor: place.verified ? '#2ECC7115' : '#FF950015' }]}>
            <CheckCircle2 color={place.verified ? '#2ECC71' : '#FF9500'} size={16} />
            <Text style={[styles.verifiedText, { color: place.verified ? '#27AE60' : '#E67E22' }]}>
              {verifiedStatus} • {lastCheck}
            </Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text }, typography.h3]}>Sobre este lugar</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        </View>

        {/* Section: Technical Specs */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Info color={theme.primary} size={24} />
            <Text style={[styles.cardTitle, { color: theme.text }, typography.h3]}>Especificaciones</Text>
          </View>
          
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Ancho Puertas</Text>
              <Text style={[styles.specValue, { color: theme.text }]}>{technicalSpecs.doorWidth}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Espacio Giro</Text>
              <Text style={[styles.specValue, { color: theme.text }]}>{technicalSpecs.turningSpace}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Bucle Magnético</Text>
              <Text style={[styles.specValue, { color: theme.text }]}>{technicalSpecs.magneticLoop}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Braille</Text>
              <Text style={[styles.specValue, { color: theme.text }]}>{technicalSpecs.brailleSignage}</Text>
            </View>
          </View>
        </View>

        {/* Section: Prices & Discounts */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <CreditCard color={theme.primary} size={24} />
            <Text style={[styles.cardTitle, { color: theme.text }, typography.h3]}>Tarifas y Descuentos</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Precio Base</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>{price}</Text>
          </View>
          <View style={[styles.discountBox, { backgroundColor: theme.primary + '15' }]}>
            <Info color={theme.primary} size={20} />
            <View style={styles.discountTextContent}>
              <Text style={[styles.discountTitle, { color: theme.primary }]}>Beneficio Discapacidad</Text>
              <Text style={[styles.discountDesc, { color: theme.text }]}>{disabilityBenefit}</Text>
            </View>
          </View>
        </View>

        {/* Section: Schedule */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Clock color={theme.primary} size={24} />
            <Text style={[styles.cardTitle, { color: theme.text }, typography.h3]}>Horarios</Text>
          </View>
          <Text style={[styles.scheduleText, { color: theme.textSecondary }]}>{schedule}</Text>
        </View>

        {/* Section: Accessibility Details */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Accessibility color={theme.primary} size={24} />
            <Text style={[styles.cardTitle, { color: theme.text }, typography.h3]}>Accesibilidad</Text>
          </View>
          <Text style={[styles.accessibilityText, { color: theme.textSecondary }]}>{accessibility}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  placeName: {
    color: '#FFFFFF',
    fontSize: 32,
  },
  scrollContent: {
    padding: 20,
  },
  infoBar: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 15,
    marginTop: -40,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ECC7115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    marginBottom: 15,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    marginLeft: 15,
    fontSize: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  priceLabel: {
    fontSize: 16,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  discountBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 16,
  },
  discountTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  discountTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  discountDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  scheduleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  accessibilityText: {
    fontSize: 15,
    lineHeight: 22,
  },
  helpSection: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  helpTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  helpDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  reportBtn: {
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportBtnText: {
    fontWeight: '700',
    fontSize: 14,
  }
});
