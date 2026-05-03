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
  Platform,
  Linking
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
  Info,
  User,
  ExternalLink,
  Map as MapIcon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        
        {/* EU Card Preview - Exact Official EDC Design */}
        <LinearGradient
          colors={['#003399', '#002a80', '#001a4d']}
          style={styles.edcCard}
        >
          {/* Header Row: Stars + Titles */}
          <View style={styles.edcHeaderRow}>
             <View style={styles.edcStarsEmblem}>
                {[...Array(12)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.edcSmallStar, 
                      { 
                        transform: [
                          { rotate: `${i * 30}deg` },
                          { translateY: -16 }
                        ] 
                      }
                    ]} 
                  />
                ))}
                <Text style={styles.edcCountryText}>ES</Text>
             </View>
             <View style={styles.edcTitleContainer}>
                <Text style={styles.edcOfficialTitleEn}>European Disability Card</Text>
                <Text style={styles.edcOfficialTitleEs}>Tarjeta Europea de Discapacidad</Text>
                <View style={styles.edcVerifiedBadge}>
                   <ShieldCheck color="#FFCC00" size={10} />
                   <Text style={styles.edcVerifiedText}>VERIFIED v3.0</Text>
                </View>
             </View>
          </View>
          
          <View style={styles.edcMainContent}>
            {/* Left: Photo */}
            <View style={styles.edcPhotoBox}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.edcPhotoImg} />
              ) : (
                <View style={styles.edcPhotoPlaceholder}>
                  <User color="#FFF" size={35} />
                </View>
              )}
            </View>

            {/* Right: Data Fields */}
            <View style={styles.edcDataArea}>
              <View style={styles.edcField}>
                <Text style={styles.edcFieldLabel}>Surname / Apellido(s)</Text>
                <Text style={styles.edcFieldValue}>{userData.lastName || 'GARCÍA LÓPEZ'}</Text>
              </View>
              <View style={styles.edcField}>
                <Text style={styles.edcFieldLabel}>First name / Nombre</Text>
                <Text style={styles.edcFieldValue}>{userData.name || 'JUAN'}</Text>
              </View>
              <View style={styles.edcFieldRow}>
                 <View style={{ flex: 1 }}>
                   <Text style={styles.edcFieldLabel}>Birth date / Nacimiento</Text>
                   <Text style={styles.edcFieldValue}>{userData.birthDate || '15/08/1985'}</Text>
                 </View>
                 <View style={styles.edcAssistantTag}>
                    <Text style={styles.edcAssistantTagText}>A</Text>
                 </View>
              </View>
            </View>
          </View>

          <View style={styles.edcBottomBar}>
             <View>
               <Text style={styles.edcFieldLabel}>Card Number / Número</Text>
               <Text style={styles.edcCardNum}>{userData.id?.toUpperCase() || 'ES-123456789'}</Text>
             </View>
             <View style={styles.edcExpiryArea}>
                <Text style={styles.edcFieldLabel}>Valid until / Vence</Text>
                <Text style={styles.edcFieldValue}>{userData.expiryDate || '31/12/2028'}</Text>
             </View>
          </View>

          {/* Discreet Braille dots at the very bottom right */}
          <View style={styles.edcOfficialBraille}>
             <View style={styles.brailleCol}>
                <View style={styles.bDot} /><View style={styles.bDot} />
             </View>
             <View style={styles.brailleCol}>
                <View style={styles.bDot} /><View style={[styles.bDot, { opacity: 0 }]} />
             </View>
             <View style={styles.brailleCol}>
                <View style={styles.bDot} /><View style={styles.bDot} />
             </View>
          </View>
        </LinearGradient>

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

        {/* Physical Card Request Info */}
        <View style={[styles.requestBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
           <View style={styles.requestContent}>
              <Info color={theme.primary} size={22} />
              <View style={styles.requestTextContainer}>
                 <Text style={[styles.requestTitle, { color: theme.primary }]}>¿No tienes la tarjeta física?</Text>
                 <Text style={[styles.requestSub, { color: theme.textSecondary }]}>
                   El despliegue en España está en proceso. Consulta el estado oficial y requisitos.
                 </Text>
              </View>
           </View>
           <TouchableOpacity 
             style={[styles.requestBtn, { backgroundColor: theme.primary }]}
             onPress={() => Linking.openURL('https://ec.europa.eu/social/main.jsp?catId=1139&langId=es')}
           >
              <Text style={styles.requestBtnText}>Ver Información Oficial</Text>
              <ExternalLink color="#FFF" size={16} />
           </TouchableOpacity>
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
            <MapIcon color="#3498DB" size={24} />
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
  edcCard: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  edcHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  edcStarsEmblem: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  edcSmallStar: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#FFCC00',
    borderRadius: 2.5,
  },
  edcCountryText: {
    color: '#FFCC00',
    fontSize: 14,
    fontWeight: '900',
  },
  edcTitleContainer: {
    marginLeft: 15,
  },
  edcOfficialTitleEn: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  edcOfficialTitleEs: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.85,
  },
  edcVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 204, 0, 0.3)',
  },
  edcVerifiedText: {
    color: '#FFCC00',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  edcMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  edcPhotoBox: {
    width: 80,
    height: 100,
    backgroundColor: '#FFFFFF15',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF30',
    overflow: 'hidden',
  },
  edcPhotoImg: {
    width: '100%',
    height: '100%',
  },
  edcPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  edcDataArea: {
    flex: 1,
    marginLeft: 15,
  },
  edcField: {
    marginBottom: 6,
  },
  edcFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  edcFieldLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  edcFieldValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  edcAssistantTag: {
    width: 22,
    height: 22,
    backgroundColor: '#FFCC00',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  edcAssistantTagText: {
    color: '#003399',
    fontSize: 14,
    fontWeight: '900',
  },
  edcBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  edcCardNum: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  edcOfficialBraille: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 2,
  },
  brailleCol: {
    gap: 2,
  },
  bDot: {
    width: 3.5,
    height: 3.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.75,
    opacity: 0.5,
  },
  requestBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 25,
  },
  requestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  requestTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  requestSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
