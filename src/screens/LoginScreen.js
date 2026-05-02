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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  Mail, 
  Lock, 
  Github, 
  User as UserIcon, 
  Apple, 
  ArrowRight,
  Accessibility,
  Globe
} from 'lucide-react-native';
import { typography } from '../theme/typography';

export function LoginScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { updateUserData } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (method) => {
    // Simulamos login exitoso
    updateUserData({ 
      isLoggedIn: true,
      loginMethod: method,
      name: method === 'Email' ? 'Viajero' : `Usuario ${method}`,
      email: email || `user@${method.toLowerCase()}.com`
    });
    Alert.alert('¡Bienvenido!', `Has iniciado sesión con ${method}`);
  };

  const SocialButton = ({ icon: Icon, label, color, onPress, textColor = '#FFFFFF' }) => {
    // Protección contra iconos no encontrados
    const ValidIcon = Icon || Mail;
    
    return (
      <TouchableOpacity 
        style={[styles.socialBtn, { backgroundColor: color }]}
        onPress={onPress}
      >
        <ValidIcon color={textColor} size={22} />
        <Text style={[styles.socialBtnText, { color: textColor }]}>Entrar con {label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo & Welcome */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo_official.jpg')} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: theme.text }, typography.h1]}>Distravel</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Tu guía de turismo accesible
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            <TouchableOpacity 
              style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleLogin('Email')}
            >
              <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
              <ArrowRight color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>O continuar con</Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            <SocialButton 
              icon={Globe} 
              label="Google" 
              color="#FFFFFF" 
              textColor="#333333"
              onPress={() => handleLogin('Google')}
            />
            <SocialButton 
              icon={Apple} 
              label="Apple" 
              color="#000000" 
              onPress={() => handleLogin('Apple')}
            />
            <SocialButton 
              icon={Github} 
              label="GitHub" 
              color="#24292E" 
              onPress={() => handleLogin('GitHub')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              ¿No tienes cuenta? <Text style={{ color: theme.primary, fontWeight: '700' }}>Regístrate</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 30,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    gap: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  loginBtn: {
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    gap: 12,
  },
  socialBtn: {
    height: 55,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00000010',
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  }
});
