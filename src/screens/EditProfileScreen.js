import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { ChevronLeft, User, Mail, Phone, MapPin, Save } from 'lucide-react-native';
import { typography } from '../theme/typography';

const InputField = ({ label, value, icon: Icon, onChangeText, keyboardType, theme }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Icon color={theme.primary} size={20} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
      />
    </View>
  </View>
);

export function EditProfileScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData } = useUser();
  
  // Usamos el estado local para la edición fluida
  const [localData, setLocalData] = useState({ ...userData });

  const handleSave = () => {
    updateUserData(localData);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Mis Datos</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="always"
        >
          <InputField 
            label="Nombre Completo" 
            value={localData.name} 
            icon={User}
            theme={theme}
            onChangeText={(text) => setLocalData(prev => ({...prev, name: text}))}
          />
          <InputField 
            label="Correo Electrónico" 
            value={localData.email} 
            icon={Mail}
            theme={theme}
            keyboardType="email-address"
            onChangeText={(text) => setLocalData(prev => ({...prev, email: text}))}
          />
          <InputField 
            label="Teléfono de Contacto" 
            value={localData.phone} 
            icon={Phone}
            theme={theme}
            keyboardType="phone-pad"
            onChangeText={(text) => setLocalData(prev => ({...prev, phone: text}))}
          />
          <InputField 
            label="Dirección Habitual" 
            value={localData.address} 
            icon={MapPin}
            theme={theme}
            onChangeText={(text) => setLocalData(prev => ({...prev, address: text}))}
          />

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Save color="#FFFFFF" size={20} />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});
