import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  StatusBar
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  Search, 
  TrendingDown, 
  CreditCard, 
  Sparkles, 
  MapPin, 
  Accessibility,
  ArrowRight
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const GUIDE_PAGES = [
  {
    title: '¿Qué es Distravel?',
    description: 'La plataforma definitiva diseñada para empoderar a los viajeros con discapacidad, proporcionando información crítica sobre accesibilidad y beneficios económicos en toda España.',
    icon: MapPin,
    color: '#3498DB'
  },
  {
    title: 'Búsqueda Inteligente',
    description: 'Utiliza nuestro buscador para encontrar monumentos, museos y lugares de interés con datos verificados de accesibilidad técnica.',
    icon: Search,
    color: '#2ECC71'
  },
  {
    title: 'Simulador de Ahorro',
    description: 'Calcula cuánto dinero ahorrarás en tus entradas según tu grado de discapacidad antes de salir de casa.',
    icon: TrendingDown,
    color: '#F1C40F'
  },
  {
    title: 'Billetera Digital',
    description: 'Lleva tu Tarjeta Europea de Discapacidad siempre contigo de forma segura para presentarla en taquillas y accesos.',
    icon: CreditCard,
    color: '#E74C3C'
  },
  {
    title: 'Explorar con IA',
    description: 'Nuestra IA te ayuda a descubrir destinos adaptados a tus necesidades específicas mediante lenguaje natural.',
    icon: Sparkles,
    color: '#9B59B6'
  }
];

export function HowToUseScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [activePage, setActivePage] = useState(0);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActivePage(index);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Guía de Uso</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {GUIDE_PAGES.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={[styles.iconContainer, { backgroundColor: page.color + '15' }]}>
              <page.icon color={page.color} size={80} strokeWidth={1.5} />
            </View>
            <Text style={[styles.title, { color: theme.text }, typography.h1]}>{page.title}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{page.description}</Text>
            
            <View style={styles.tipCard}>
              <Accessibility color={theme.primary} size={20} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                {index === 0 ? 'Distravel es 100% gratuito para usuarios con discapacidad.' : 
                 index === 1 ? 'Puedes filtrar por tipo de accesibilidad en la pantalla de inicio.' :
                 index === 2 ? 'Configura tu grado de discapacidad en tu perfil para cálculos precisos.' :
                 index === 3 ? 'Añade una foto de alta calidad para facilitar la validación.' :
                 'Pregúntale a la IA: "¿Qué museos en Madrid son mejores para silla de ruedas?"'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.paginationDots}>
          {GUIDE_PAGES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: activePage === index ? theme.primary : theme.border },
                activePage === index && { width: 24 }
              ]} 
            />
          ))}
        </View>

        {activePage === GUIDE_PAGES.length - 1 ? (
          <TouchableOpacity 
            style={[styles.finishButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.finishButtonText}>¡Entendido!</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.nextIndicator}>
            <Text style={[styles.nextText, { color: theme.textSecondary }]}>Desliza para continuar</Text>
            <ArrowRight color={theme.textSecondary} size={16} />
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingVertical: 20,
  },
  page: {
    width: width,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 40,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 10,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  finishButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  nextIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  }
});
