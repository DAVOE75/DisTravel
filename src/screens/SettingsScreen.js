import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Switch, 
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Accessibility, 
  Circle,
  Globe,
  Languages,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const SettingRow = ({ icon: Icon, title, value, onToggle, isLast, theme, isDarkMode, type = 'switch', description }) => (
  <View style={[styles.row, { borderBottomColor: theme.border }, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
        <Icon color={theme.primary} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        {description && <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>{description}</Text>}
      </View>
    </View>
    {type === 'switch' ? (
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: theme.primary }}
        thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
      />
    ) : (
      <TouchableOpacity style={styles.rowRight} onPress={onToggle}>
        <Text style={[styles.rowValue, { color: theme.primary }]}>{value}</Text>
        <ChevronRight color={theme.textSecondary} size={18} />
      </TouchableOpacity>
    )}
  </View>
);

export function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { userData, updateUserData } = useUser();
  const [isKeyModalVisible, setIsKeyModalVisible] = React.useState(false);
  const [tempKey, setTempKey] = React.useState(userData.aiApiKey || '');

  const handleSaveKey = () => {
    updateUserData({ aiApiKey: tempKey });
    setIsKeyModalVisible(false);
    Alert.alert('Configuración Guardada', 'Tu clave de API se ha actualizado correctamente.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Modal
        visible={isKeyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsKeyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }, typography.h3]}>Gemini API Key</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Introduce tu clave de Google Gemini para obtener datos reales. Puedes obtener una gratis en Google AI Studio.
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}
              placeholder="AIzaSy..."
              placeholderTextColor={theme.textSecondary}
              value={tempKey}
              onChangeText={setTempKey}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: 'transparent' }]}
                onPress={() => setIsKeyModalVisible(false)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveKey}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Personalización</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={isDarkMode ? Moon : Sun} 
            title="Tema Visual" 
            description={isDarkMode ? 'Modo Oscuro activado' : 'Modo Claro activado'}
            value={isDarkMode} 
            onToggle={toggleTheme}
            theme={theme}
            isDarkMode={isDarkMode}
          />
          <SettingRow 
            icon={Languages} 
            title="Idioma de la App" 
            type="select"
            value="Español (ES)" 
            onToggle={() => {}}
            isLast={true}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Accesibilidad Premium</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={Accessibility} 
            title="Guiado por Voz" 
            description="Asistente de audio durante la navegación"
            value={userData.voiceGuidance} 
            onToggle={(val) => updateUserData({ voiceGuidance: val })}
            theme={theme}
            isDarkMode={isDarkMode}
          />
          <SettingRow 
            icon={Circle} 
            title="Contraste Dinámico" 
            description="Optimiza colores para mejor lectura"
            value={userData.highContrast} 
            onToggle={(val) => updateUserData({ highContrast: val })}
            isLast={true}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Servicios de IA</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={Zap} 
            title="Gemini API Key" 
            description={userData.aiApiKey ? 'Clave configurada (activa)' : 'Configurar para datos reales'}
            type="select"
            value={userData.aiApiKey ? '********' : 'Configurar'} 
            onToggle={() => setIsKeyModalVisible(true)}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Seguridad</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow 
            icon={Shield} 
            title="Privacidad" 
            type="select"
            value="Gestionar" 
            onToggle={() => {}}
            isLast={true}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>Distravel PRO v1.3.5</Text>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>Hecho para un turismo inclusivo 🌍</Text>
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
    flex: 1,
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
  rowDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
  },
});
