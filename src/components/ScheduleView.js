import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Clock } from 'lucide-react-native';

export function ScheduleView({ schedule }) {
  const days = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
  ];

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock color={colors.primary} size={20} />
        <Text style={styles.headerTitle}>Horarios de Apertura</Text>
      </View>
      
      <View style={styles.daysList}>
        {days.map((day) => (
          <View key={day.key} style={[styles.dayRow, today.includes(day.key) && styles.todayRow]}>
            <Text style={[styles.dayLabel, today.includes(day.key) && styles.todayText]}>
              {day.label}
            </Text>
            <Text style={[styles.dayTime, today.includes(day.key) && styles.todayText]}>
              {schedule[day.key]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  daysList: {
    gap: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  todayRow: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dayLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  dayTime: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
