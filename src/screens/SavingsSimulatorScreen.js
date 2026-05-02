import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  Wallet, 
  TrendingDown, 
  Building2,
  Users,
  CheckCircle2
} from 'lucide-react-native';
import { typography } from '../theme/typography';
import { MONUMENTOS } from '../data/monumentos';

const { width } = Dimensions.get('window');

export function SavingsSimulatorScreen({ navigation }) {
  const { theme } = useTheme();
  const { userData } = useUser();
  const [selectedCity, setSelectedCity] = useState('Madrid');

  const calculateSavings = () => {
    const monuments = MONUMENTOS[selectedCity] || [];
    let totalGeneral = 0;
    let totalDisability = 0;

    monuments.forEach(m => {
      // Extraemos el primer número que aparezca en el precio general
      const generalPriceMatch = m.price.match(/\d+/);
      const generalPrice = generalPriceMatch ? parseInt(generalPriceMatch[0]) : 0;
      totalGeneral += generalPrice;

      // Lógica de ahorro simplificada para el simulador
      const isFree = m.disabilityBenefit.toLowerCase().includes('gratis');
      if (!isFree) {
        totalDisability += generalPrice * 0.5; // Supongamos 50% si no es gratis
      }
    });

    return {
      general: totalGeneral,
      disability: totalDisability,
      saved: totalGeneral - totalDisability
    };
  };

  const results = calculateSavings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Calculadora de Ahorro</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Context Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.primary }]}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Tu Grado de Discapacidad</Text>
            <Text style={styles.profileValue}>{userData.disabilityDegree}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Acompañante</Text>
            <Text style={styles.profileValue}>Incluido</Text>
          </View>
        </View>

        {/* City Selector (Simplified) */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Selecciona tu destino</Text>
        <View style={styles.citySelector}>
          {['Madrid', 'Barcelona', 'Granada'].map(city => (
            <TouchableOpacity 
              key={city}
              style={[
                styles.cityBtn, 
                { backgroundColor: selectedCity === city ? theme.primary : theme.surface, borderColor: theme.border }
              ]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityBtnText, { color: selectedCity === city ? '#FFFFFF' : theme.text }]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result Card */}
        <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TrendingDown color={theme.primary} size={40} />
          <Text style={[styles.resultTitle, { color: theme.text }]}>¡Tu Ahorro Estimado!</Text>
          <Text style={[styles.savingsValue, { color: theme.primary }]}>{results.saved}€</Text>
          <Text style={[styles.resultSub, { color: theme.textSecondary }]}>En las entradas principales de {selectedCity}</Text>
          
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Precio Turista Estándar</Text>
              <Text style={[styles.breakdownValue, { color: theme.text }]}>{results.general}€</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Precio con DisTravel</Text>
              <Text style={[styles.breakdownValue, { color: '#2ECC71' }]}>{results.disability}€</Text>
            </View>
          </View>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>¿Por qué ahorras tanto?</Text>
          <View style={styles.benefitItem}>
            <CheckCircle2 color={theme.primary} size={20} />
            <Text style={[styles.benefitText, { color: theme.text }]}>Entrada gratuita en Museos Estatales</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle2 color={theme.primary} size={20} />
            <Text style={[styles.benefitText, { color: theme.text }]}>Descuento para acompañante (Ley 2024)</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle2 color={theme.primary} size={20} />
            <Text style={[styles.benefitText, { color: theme.text }]}>Tarifa Dorada en transportes urbanos</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
          <Text style={styles.actionBtnText}>Ver monumentos de {selectedCity}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  profileLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  profileValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  citySelector: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  cityBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
  },
  cityBtnText: {
    fontWeight: '700',
  },
  resultCard: {
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 15,
  },
  savingsValue: {
    fontSize: 64,
    fontWeight: '900',
    marginVertical: 10,
  },
  resultSub: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 25,
  },
  breakdown: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  benefitsSection: {
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  actionBtn: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  }
});
