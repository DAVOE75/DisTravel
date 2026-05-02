import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MapPin, Star } from 'lucide-react-native';

export const CityCard = ({ name, country, rating, image }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.image}
        imageStyle={{ borderRadius: 24 }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.pinContainer}>
              <MapPin color={colors.primary} size={16} />
            </View>
          </View>
          
          <View style={styles.footer}>
            <View>
              <Text style={[styles.name, typography.h3]}>{name}</Text>
              <Text style={[styles.country, typography.caption]}>{country}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star color={colors.accent} size={14} fill={colors.accent} />
              <Text style={styles.ratingText}>{rating}</Text>
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
