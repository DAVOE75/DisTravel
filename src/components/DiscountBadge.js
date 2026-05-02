import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accessibility } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const DiscountBadge = ({ percentage }) => {
  return (
    <View style={styles.container}>
      <Accessibility color={colors.secondary} size={14} style={styles.icon} />
      <Text style={[styles.text, typography.caption]}>
        {percentage}% Descuento Discapacidad
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
