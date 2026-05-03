import React from 'react';
import { View, Image, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export function SplashScreen() {
  const { theme, isDarkMode, logo } = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <LinearGradient
        colors={isDarkMode ? ['#070B14', '#111827'] : ['#FFFFFF', '#F8FAFC']}
        style={styles.gradient}
      >
        <View style={[styles.logoContainer, { 
          backgroundColor: isDarkMode ? 'transparent' : '#FFFFFF',
          shadowColor: isDarkMode ? '#000' : '#64748B'
        }]}>
          <Image 
            source={logo} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
            VIAJAR SIN BARRERAS
          </Text>
        </View>
      </LinearGradient>
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
