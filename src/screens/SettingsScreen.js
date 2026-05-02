import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Switch, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Accessibility, 
  Circle
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const SettingRow = ({ icon: Icon, title, value, onToggle, isLast, theme, isDarkMode }) => (
  <View style={[styles.row, { borderBottomColor: theme.border }, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
        <Icon color={theme.primary} size={20} />
      </View>
      <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
    </View>
    <Switch 
      value={value} 
      onValueChange={onToggle}
      trackColor={{ false: '#767577', true: theme.primary }}
      thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
    />
  </View>
);

export function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Ajustes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Apariencia</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={isDarkMode ? Moon : Sun} 
            title="Modo Oscuro" 
            value={isDarkMode} 
            onToggle={toggleTheme}
            isLast={true}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Accesibilidad</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={Accessibility} 
            title="Asistente de Voz" 
            value={false} 
            onToggle={() => {}}
            theme={theme}
            isDarkMode={isDarkMode}
          />
          <SettingRow 
            icon={Circle} 
            title="Alto Contraste" 
            value={false} 
            onToggle={() => {}}
            isLast={true}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notificaciones y Privacidad</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={Bell} 
            title="Notificaciones Push" 
            value={true} 
            onToggle={() => {}}
            theme={theme}
            isDarkMode={isDarkMode}
          />
          <SettingRow 
            icon={Shield} 
            title="Privacidad de Datos" 
            value={true} 
            onToggle={() => {}}
            isLast={true}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>Distravel v1.0.4</Text>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>Hecho con ❤️ para un turismo sin barreras</Text>
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
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
