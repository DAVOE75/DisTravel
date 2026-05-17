import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MapPin, Star, Accessibility, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export const CityCard = ({ city, name, country, rating, image, onPress, theme }) => {
  // Soporte para objeto city o props individuales
  const displayCity = city || { 
    name, 
    province: country, 
    rating: rating || 5.0, 
    image,
    count: 0
  };
  
  const { 
    name: cityName, 
    province, 
    image: cityImage, 
    rating: cityRating, 
    isUserAdded,
    count: placesCount 
  } = displayCity;

  const currentTheme = theme || colors;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={styles.container} 
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: cityImage || image || 'https://images.unsplash.com/photo-1548013146-72479768b921' }}
        style={styles.image}
        imageStyle={{ borderRadius: 32 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(7, 11, 20, 0.4)', 'rgba(7, 11, 20, 0.95)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            {isUserAdded && (
              <View style={styles.newBadge}>
                <Sparkles color="#FFF" size={12} fill="#FFF" />
                <Text style={styles.newBadgeText}>MUNICPIO IA</Text>
              </View>
            )}
            <View style={styles.pinContainer}>
              <MapPin color={colors.primary} size={14} />
            </View>
          </View>
          
          <View style={styles.content}>
            <View style={styles.mainInfo}>
              <Text style={[styles.name, typography.h2]} numberOfLines={1}>{cityName}</Text>
              <View style={styles.locationRow}>
                <Text style={[styles.country, typography.caption]} numberOfLines={1}>
                  {province || country || 'España'}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.metricContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
                  <Accessibility color="#2ECC71" size={14} />
                </View>
                <Text style={styles.metricText}>{placesCount || 0} LUGARES</Text>
              </View>

              <View style={styles.ratingContainer}>
                <Star color="#EFBF04" size={14} fill="#EFBF04" />
                <Text style={styles.ratingText}>{(cityRating || rating || 5.0).toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 380,
    marginRight: 20,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: '#8E44AD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pinContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    gap: 16,
  },
  mainInfo: {
    gap: 4,
  },
  name: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  country: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 10,
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#EFBF04',
    fontSize: 13,
    fontWeight: '900',
  },
});

