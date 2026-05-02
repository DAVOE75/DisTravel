import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Download, 
  Share2, 
  Calendar,
  CreditCard,
  Info
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

export function DigitalWalletScreen({ navigation }) {
  const { theme } = useTheme();
  const { userData } = useUser();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Billetera Digital</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TU TARJETA EUROPEA</Text>
        
        {/* EU Card Preview */}
        <View style={[styles.card, { backgroundColor: '#003399' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.euStars}>
              <Text style={styles.euText}>EU</Text>
            </View>
            <Text style={styles.cardTitle}>European Disability Card</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.userPhotoPlaceholder}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.userPhoto} />
              ) : (
                <View style={styles.photoIcon} />
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.userName}>{userData.name || 'VIAJERO DISTRAVEL'}</Text>
              <Text style={styles.userId}>ID: {userData.id?.toUpperCase() || 'GUEST-001'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{userData.disabilityDegree}% DISCAPACIDAD</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.expiryContainer}>
              <Calendar color="#FFFFFF" size={12} />
              <Text style={styles.expiryText}>VALIDEZ: {userData.expiryDate || '31/12/2028'}</Text>
            </View>
            <Image 
              source={require('../../assets/logo_official.png')} 
              style={styles.cardLogo} 
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Security Status */}
        <View style={[styles.statusBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ShieldCheck color="#2ECC71" size={24} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: theme.text }]}>Documento Verificado</Text>
            <Text style={[styles.statusSub, { color: theme.textSecondary }]}>Cifrado con seguridad biométrica local</Text>
          </View>
        </View>

        {/* Quick Scan QR Section */}
        <View style={styles.qrSection}>
           <View style={[styles.qrContainer, { backgroundColor: '#FFF' }]}>
              <View style={styles.qrPlaceholder}>
                <View style={[styles.qrPixel, { top: 0, left: 0 }]} />
                <View style={[styles.qrPixel, { top: 0, right: 0 }]} />
                <View style={[styles.qrPixel, { bottom: 0, left: 0 }]} />
                <View style={styles.qrCenter}>
                   <Image 
                     source={require('../../assets/logo_official.png')} 
                     style={{ width: 40, height: 40, tintColor: theme.primary }} 
                   />
                </View>
              </View>
           </View>
           <Text style={[styles.qrHint, { color: theme.textSecondary }]}>Muestre este QR en taquilla para validación rápida</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Download color={theme.primary} size={22} />
            <Text style={[styles.actionText, { color: theme.text }]}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Share2 color={theme.primary} size={22} />
            <Text style={[styles.actionText, { color: theme.text }]}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Other Credentials Section */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 40 }]}>OTRAS CREDENCIALES</Text>
        <TouchableOpacity style={[styles.credItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.credIconContainer}>
            <CreditCard color={theme.primary} size={24} />
          </View>
          <View style={styles.credInfo}>
            <Text style={[styles.credTitle, { color: theme.text }]}>Certificado Nacional</Text>
            <Text style={[styles.credSub, { color: theme.textSecondary }]}>Emitido por {userData.issuingBody || 'IMSERSO'}</Text>
          </View>
          <ChevronLeft color={theme.textSecondary} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.credItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.credIconContainer, { backgroundColor: '#3498DB15' }]}>
            <Map color="#3498DB" size={24} />
          </View>
          <View style={styles.credInfo}>
            <Text style={[styles.credTitle, { color: theme.text }]}>Tarjeta de Estacionamiento PMR</Text>
            <Text style={[styles.credSub, { color: theme.textSecondary }]}>Válida en toda la Unión Europea</Text>
          </View>
          <ChevronLeft color={theme.textSecondary} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.credItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.credIconContainer, { backgroundColor: '#E67E2215' }]}>
            <Calendar color="#E67E22" size={24} />
          </View>
          <View style={styles.credInfo}>
            <Text style={[styles.credTitle, { color: theme.text }]}>Permiso de Eurotaxi</Text>
            <Text style={[styles.credSub, { color: theme.textSecondary }]}>Acreditación para transporte adaptado</Text>
          </View>
          <ChevronLeft color={theme.textSecondary} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
          <Info color={theme.primary} size={20} />
          <Text style={[styles.infoText, { color: theme.primary }]}>
            Esta billetera digital es un documento de apoyo. Lleve siempre consigo el original físico si es requerido por las autoridades.
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  euStars: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  euText: {
    color: '#003399',
    fontWeight: '900',
    fontSize: 14,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  userPhotoPlaceholder: {
    width: 70,
    height: 85,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userPhoto: {
    width: '100%',
    height: '100%',
  },
  photoIcon: {
    flex: 1,
    backgroundColor: '#FFFFFF40',
  },
  cardInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userId: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badge: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  badgeText: {
    color: '#003399',
    fontSize: 10,
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
  },
  cardLogo: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
    opacity: 0.8,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 25,
  },
  statusInfo: {
    marginLeft: 15,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  credItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
  },
  credIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  credInfo: {
    flex: 1,
    marginLeft: 15,
  },
  credTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  credSub: {
    fontSize: 12,
    marginTop: 2,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  qrContainer: {
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  qrPlaceholder: {
    width: 140,
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  qrPixel: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 8,
    borderColor: '#333',
  },
  qrCenter: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    gap: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  }
});
