import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MapPin, Star } from 'lucide-react-native';

import { Sparkles } from 'lucide-react-native';

export const CityCard = ({ city, name, country, rating, image, onPress, theme }) => {
  // Soporte para objeto city o props individuales
  const displayCity = city || { name, province: country, rating: rating || 5.0, image };
  const { name: cityName, province, image: cityImage, rating: cityRating, isUserAdded } = displayCity;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ImageBackground
        source={{ uri: cityImage || image }}
        style={styles.image}
        imageStyle={{ borderRadius: 24 }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            {isUserAdded && (
              <View style={styles.newBadge}>
                <Sparkles color="#FFF" size={12} />
                <Text style={styles.newBadgeText}>NUEVO</Text>
              </View>
            )}
            <View style={styles.pinContainer}>
              <MapPin color={colors.primary} size={16} />
            </View>
          </View>
          
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, typography.h3]} numberOfLines={1}>{cityName}</Text>
              <Text style={[styles.country, typography.caption]} numberOfLines={1}>{province || country}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star color={colors.accent} size={14} fill={colors.accent} />
              <Text style={styles.ratingText}>{cityRating || rating || '5.0'}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 300,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  image: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: '#E67E22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  pinContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  footer: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  name: {
    color: colors.text,
  },
  country: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
