import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search, Mic } from 'lucide-react-native';
import { colors } from '../theme/colors';

export const AppSearch = () => {
  return (
    <View style={styles.container}>
      <Search color={colors.textSecondary} size={20} style={styles.icon} />
      <TextInput
        placeholder="Buscar ciudades, atracciones..."
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <View style={styles.micContainer}>
        <Mic color={colors.primary} size={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  micContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    padding: 8,
    borderRadius: 12,
  },
});
