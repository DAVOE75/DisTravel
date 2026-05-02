import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Info } from 'lucide-react-native';

export function DiscountsList({ basePrice, discount33, discount65 }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Info size={18} color={colors.textSecondary} />
        <Text style={[styles.headerTitle, typography.h4]}>Detalle de Tarifas</Text>
      </View>

      <View style={styles.item}>
        <Text style={[styles.itemLabel, typography.body]}>Entrada General</Text>
        <Text style={[styles.itemValue, typography.body]}>{basePrice}€</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <View>
          <Text style={[styles.itemLabel, typography.body]}>Grado ≥ 33%</Text>
          <Text style={[styles.itemSub, typography.caption]}>Discapacidad acreditada</Text>
        </View>
        <Text style={[styles.itemValue, { color: colors.primary }]}>
          {discount33 === 0 ? 'Gratis' : `${discount33}€`}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <View>
          <Text style={[styles.itemLabel, typography.body]}>Grado ≥ 65%</Text>
          <Text style={[styles.itemSub, typography.caption]}>Incluye acompañante</Text>
        </View>
        <Text style={[styles.itemValue, { color: colors.primary }]}>
          {discount65 === 0 ? 'Gratis' : `${discount65}€`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: colors.text,
    marginLeft: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemLabel: {
    color: colors.text,
    fontWeight: '500',
  },
  itemSub: {
    color: colors.textSecondary,
  },
  itemValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },
});
