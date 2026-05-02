import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Ticket, Users } from 'lucide-react-native';

export function DisabilityPriceCard({ price, label, hasCompanion }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ticket size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, typography.caption]}>{label}</Text>
          <Text style={[styles.price, typography.h2]}>{price}</Text>
        </View>
      </View>
      
      {hasCompanion && (
        <View style={styles.companionBadge}>
          <Users size={14} color={colors.secondary} />
          <Text style={styles.companionText}>+ Acompañante Gratis</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginLeft: 12,
  },
  label: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    color: colors.primary,
  },
  companionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  companionText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
});
