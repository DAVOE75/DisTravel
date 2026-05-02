import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { 
  Accessibility, 
  ChevronUp as Elevator, 
  Headphones, 
  CircleUser as Wc, 
  Eye as Braille, 
  Car 
} from 'lucide-react-native';

export function AccessibilitySpecs({ specs }) {
  const specItems = [
    { key: 'wheelchair', label: 'Acceso Silla', icon: Accessibility },
    { key: 'elevator', label: 'Ascensor', icon: Elevator },
    { key: 'audioGuide', label: 'Audioguía', icon: Headphones },
    { key: 'adaptedWC', label: 'Baño Adaptado', icon: Wc },
    { key: 'braille', label: 'Braille', icon: Braille },
    { key: 'parking', label: 'Parking PMR', icon: Car },
  ];

  return (
    <View style={styles.container}>
      {specItems.map((item) => {
        const Icon = item.icon;
        const isAvailable = specs[item.key];
        
        return (
          <View key={item.key} style={[styles.item, !isAvailable && styles.itemDisabled]}>
            <View style={[styles.iconContainer, isAvailable ? styles.iconActive : styles.iconInactive]}>
              <Icon color={isAvailable ? colors.primary : colors.textSecondary} size={20} />
            </View>
            <Text style={[styles.label, isAvailable ? styles.labelActive : styles.labelInactive]}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  item: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconActive: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  iconInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: colors.text,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
