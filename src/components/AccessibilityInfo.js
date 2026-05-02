import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Accessibility, Eye, Ear, Brain } from 'lucide-react-native';

const ACCESSIBILITY_TYPES = {
  wheelchair: {
    icon: Accessibility,
    label: 'Acceso en silla de ruedas',
    color: colors.primary,
  },
  visual: {
    icon: Eye,
    label: 'Braille y Audio Guía',
    color: '#3498DB',
  },
  hearing: {
    icon: Ear,
    label: 'Lengua de Señas',
    color: '#E67E22',
  },
  sensory: {
    icon: Brain,
    label: 'Espacio de baja estimulación',
    color: '#9B59B6',
  },
};

export function AccessibilityInfo({ type, description }) {
  const config = ACCESSIBILITY_TYPES[type];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
        <Icon size={24} color={config.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, typography.body]}>{config.label}</Text>
        {description && (
          <Text style={[styles.description, typography.caption]}>{description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
