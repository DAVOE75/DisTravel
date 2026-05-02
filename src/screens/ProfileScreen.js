import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  User, 
  ChevronRight, 
  ShieldCheck, 
  HelpCircle, 
  LogOut,
  Camera,
  Accessibility,
  CheckCircle,
  FileText
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
  const { userData } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <User color={theme.primary} size={50} />
            </View>
            <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.primary }]}>
              <Camera color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }, typography.h1]}>{userData.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{userData.email}</Text>
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
              source={{ uri: userData.idCardImage }} 
              style={styles.idCardImage}
              blurRadius={1}
            />
            <View style={styles.cardOverlay}>
              <FileText color="#FFFFFF" size={32} />
              <Text style={styles.cardOverlayText}>Toca para gestionar credencial</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats / Badges */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Accessibility color={theme.success} size={24} />
            <Text style={[styles.statValue, { color: theme.text }]}>{userData.disabilityDegree}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Discapacidad</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <CheckCircle color={theme.accent} size={24} />
            <Text style={[styles.statValue, { color: theme.text }]}>Oro</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Nivel Usuario</Text>
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
              isLast={true}
              theme={theme}
              onPress={() => navigation.navigate('DisabilityDetail')}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut color="#E74C3C" size={20} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: '48%',
    padding: 16,
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
});
