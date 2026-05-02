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
  const [selectedCity, setSelectedCity] = useState('Alicante');

  const calculateSavings = () => {
    // Buscar monumentos en la ciudad seleccionada (Premium + Usuario)
    const monuments = (userData.contributions || []).filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
    
    let totalGeneral = 0;
    let totalDisability = 0;

    monuments.forEach(m => {
      if (m.tariffs && Array.isArray(m.tariffs)) {
        const general = m.tariffs.find(t => t.label.toLowerCase().includes('general'))?.value || 10;
        const pcd = m.tariffs.find(t => t.label.toLowerCase().includes('pcd') || t.label.toLowerCase().includes('reducida'))?.value || 0;
        
        totalGeneral += general;
        totalDisability += pcd;
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
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Simulador de Ahorro</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Context Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.primary }]}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Tu Grado</Text>
            <Text style={styles.profileValue}>{userData.disabilityDegree || '33'}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Tu Ahorro Real</Text>
            <Text style={styles.profileValue}>{Math.round(userData.totalSavings || 0)}€</Text>
          </View>
        </View>

        {/* City Selector */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Simular viaje a...</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citySelector}>
          {['Alicante', 'Madrid', 'Barcelona', 'Granada', 'Medina del Campo'].map(city => (
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
        </ScrollView>

        {/* Result Card */}
        <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.savingsIconContainer}>
             <TrendingDown color="#FFF" size={30} />
          </View>
          <Text style={[styles.resultTitle, { color: theme.text }]}>¡Ahorrarías en {selectedCity}!</Text>
          <Text style={[styles.savingsValue, { color: theme.primary }]}>{results.saved.toFixed(0)}€</Text>
          <Text style={[styles.resultSub, { color: theme.textSecondary }]}>En un recorrido de {userData.contributions?.filter(p => p.city === selectedCity).length || 0} puntos de interés</Text>
          
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLabelContainer}>
                <Building2 color={theme.textSecondary} size={14} />
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Precio Entradas Estándar</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: theme.text }]}>{results.general.toFixed(2)}€</Text>
            </View>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLabelContainer}>
                <Wallet color="#2ECC71" size={14} />
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Tu Precio con Descuento</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#2ECC71' }]}>{results.disability.toFixed(2)}€</Text>
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
  savingsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
