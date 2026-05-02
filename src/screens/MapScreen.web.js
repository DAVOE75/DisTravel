import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { typography } from '../theme/typography';

export function MapScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Mapa de Accesibilidad</Text>
      </View>
      
      <View style={styles.content}>
        <View style={[styles.warningBox, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
          <MapPin color={theme.primary} size={40} />
          <Text style={[styles.warningTitle, { color: theme.text }]}>Vista Web Limitada</Text>
          <Text style={[styles.warningText, { color: theme.textSecondary }]}>
            La visualización de mapas interactivos nativos está optimizada para la aplicación móvil. 
            Por favor, utiliza la app en un dispositivo real para disfrutar de la experiencia completa.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.mobileBtn, { backgroundColor: theme.primary }]}
          onPress={() => alert('¡Descarga la app para ver el mapa interactivo!')}
        >
          <Text style={styles.mobileBtnText}>Abrir en App Móvil</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  warningBox: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },
  warningText: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 16,
  },
  mobileBtn: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },
  mobileBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  }
});
