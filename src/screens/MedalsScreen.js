import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  Trophy, 
  Shield, 
  Star, 
  Castle, 
  TrendingDown, 
  Lock,
  Sparkles,
  MapPin,
  CheckCircle
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const ALL_BADGES = [
  { 
    id: 'accessibility-hero', 
    title: 'Héroe de la Accesibilidad', 
    icon: Shield, 
    color: '#2ECC71',
    description: 'Validar 5 puntos técnicos',
    xp: 500
  },
  { 
    id: 'alicante-ambassador', 
    title: 'Embajador de Alicante', 
    icon: Castle, 
    color: '#3498DB',
    description: 'Visitar 3 monumentos en Alicante',
    xp: 1000
  },
  { 
    id: 'master-saver', 
    title: 'Maestro del Ahorro', 
    icon: TrendingDown, 
    color: '#F1C40F',
    description: 'Ahorrar más de 50€ reales',
    xp: 750
  },
  { 
    id: 'globetrotter', 
    title: 'Globetrotter', 
    icon: Star, 
    color: '#9B59B6',
    description: 'Visitar 10 ciudades diferentes',
    xp: 2000
  },
  { 
    id: 'pioneer', 
    title: 'Pionero Distravel', 
    icon: Sparkles, 
    color: '#E67E22',
    description: 'Registrar un nuevo lugar inédito',
    xp: 1500
  }
];

export function MedalsScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData } = useUser();

  const userBadges = userData.badges || [];
  const levelProgress = (userData.experience % 1000) / 10; // Simplificado para visualización

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Mis Logros</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Level Progress Header */}
        <View style={[styles.levelCard, { backgroundColor: theme.primary }]}>
          <View style={styles.levelInfo}>
            <View>
              <Text style={styles.levelLabel}>Nivel Actual</Text>
              <Text style={styles.levelValue}>{userData.level || 1}</Text>
            </View>
            <Trophy color="#FFFFFF" size={40} opacity={0.8} />
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{userData.experience} XP</Text>
              <Text style={styles.progressText}>Próximo Nivel: {(userData.level || 1) * 1000} XP</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <View style={[styles.progressBarFill, { width: `${levelProgress}%`, backgroundColor: '#FFFFFF' }]} />
            </View>
          </View>

          <View style={styles.titleContainer}>
             <Sparkles color="#EFBF04" size={14} />
             <Text style={styles.titleText}>{userData.unlockedTitles?.[userData.unlockedTitles.length - 1] || 'Viajero Novel'}</Text>
          </View>
        </View>

        {/* Badges Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Medallas y Trofeos</Text>
        <View style={styles.badgesGrid}>
          {ALL_BADGES.map((badge) => {
            const isUnlocked = userBadges.includes(badge.id);
            return (
              <View 
                key={badge.id} 
                style={[
                  styles.badgeCard, 
                  { 
                    backgroundColor: isUnlocked ? theme.surface : 'rgba(0,0,0,0.03)',
                    borderColor: isUnlocked ? badge.color : theme.border,
                    opacity: isUnlocked ? 1 : 0.6
                  }
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: isUnlocked ? badge.color + '15' : 'rgba(0,0,0,0.05)' }]}>
                  {isUnlocked ? (
                    <badge.icon color={badge.color} size={32} />
                  ) : (
                    <Lock color={theme.textSecondary} size={24} />
                  )}
                </View>
                <Text style={[styles.badgeName, { color: theme.text }]} numberOfLines={1}>
                  {badge.title}
                </Text>
                <Text style={[styles.badgeDesc, { color: theme.textSecondary }]}>
                  {badge.description}
                </Text>
                {isUnlocked && (
                   <View style={styles.unlockedTag}>
                      <CheckCircle color="#2ECC71" size={12} />
                      <Text style={styles.unlockedText}>DESBLOQUEADO</Text>
                   </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
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
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  levelCard: {
    padding: 25,
    borderRadius: 30,
    marginBottom: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  levelValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
  },
  progressSection: {
    marginTop: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.9,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  badgeCard: {
    width: (width - 55) / 2,
    padding: 15,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.8,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unlockedText: {
    color: '#27AE60',
    fontSize: 8,
    fontWeight: '900',
  }
});
