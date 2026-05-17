import React from 'react';
import { View, Image, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export function SplashScreen() {
  const { isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#070B14' : '#FFFFFF' }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Text style={{ color: isDarkMode ? '#FFF' : '#000', fontSize: 20 }}>Cargando DisTravel...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 240,
    height: 240,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    // Elevation for Android
    elevation: 15,
  },
  logo: {
    width: 180,
    height: 180,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
  }
});
