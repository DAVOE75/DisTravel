import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight,
  ChevronLeft,
  Shield
} from 'lucide-react-native';
import { API_BASE_URL } from '../config/api';

export function RegisterScreen({ navigation }) {
  const { theme, isDarkMode, logo } = useTheme();
  const { updateUserData } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Generar un ID único para el usuario
      const userId = 'u_' + Date.now();
      
      // 2. Registrar en PostgreSQL
      const response = await fetch(`${API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          email,
          name,
          password, // En una app real usaríamos hashing
          isLoggedIn: true,
          xp: 0,
          level: 1,
          medals: [],
          data: { registrationDate: new Date().toISOString() }
        })
      });

      if (response.ok) {
        // 3. Actualizar estado local
        updateUserData({
          id: userId,
          name,
          email,
          isLoggedIn: true,
          xp: 0,
          level: 1,
          medals: []
        });
        
        Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada con éxito.');
        navigation.navigate('Home');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'No se pudo crear la cuenta');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'Problema de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={theme.text} size={28} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Crear Cuenta</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Únete a la comunidad de turismo accesible más grande
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <UserIcon color={theme.textSecondary} size={20} />
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                placeholder="Nombre completo"
                placeholderTextColor={theme.textSecondary + '80'}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Mail color={theme.textSecondary} size={20} />
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Lock color={theme.textSecondary} size={20} />
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                placeholder="Contraseña"
                placeholderTextColor={theme.textSecondary + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Shield color={theme.textSecondary} size={20} />
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirmar Contraseña"
                placeholderTextColor={theme.textSecondary + '80'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.registerBtn, { backgroundColor: theme.primary }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={[styles.registerBtnText, { color: isDarkMode ? '#070B14' : '#FFFFFF' }]}>Registrarse Ahora</Text>
                  <ArrowRight color={isDarkMode ? '#070B14' : '#FFFFFF'} size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              ¿Ya tienes cuenta? <Text onPress={() => navigation.navigate('Login')} style={{ color: theme.primary, fontWeight: '700' }}>Inicia Sesión</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 30, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 10 },
  subtitle: { fontSize: 16, opacity: 0.8, lineHeight: 22 },
  form: { gap: 15 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  input: { flex: 1, marginLeft: 15, fontSize: 16 },
  registerBtn: {
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },
  registerBtnText: { fontSize: 18, fontWeight: '800', marginRight: 10 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 14 }
});
