import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar,
  Clock,
  Zap,
  Info
} from 'lucide-react-native';
import { typography } from '../theme/typography';

export function AdminValidationsScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData } = useUser();
  const insets = useSafeAreaInsets();

  // Filtrar contribuciones que NO están verificadas
  const pendingLocations = useMemo(() => {
    return (userData?.contributions || []).filter(p => !p.verified && p.id !== 'castillo-belmonte' && p.id !== 'castillo-la-mota' && p.id !== 'castillo-santa-barbara');
  }, [userData.contributions]);

  const handleValidate = async (placeId) => {
    const updated = userData.contributions.map(p => 
      p.id === placeId ? { ...p, verified: true, verifiedStatus: 'Verificado' } : p
    );
    await updateUserData({ contributions: updated });
    Alert.alert("¡Validado!", "La ubicación ahora es pública para todos los usuarios.");
  };

  const handleReject = (placeId) => {
    Alert.alert(
      "Rechazar Ubicación",
      "¿Estás seguro de que deseas eliminar esta propuesta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            const updated = userData.contributions.filter(p => p.id !== placeId);
            await updateUserData({ contributions: updated });
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: theme.primary }]}>{item.category || 'Monumento'}</Text>
          </View>
        </View>
        
        <View style={styles.locationInfo}>
          <MapPin color={theme.textSecondary} size={14} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]}>{item.city}</Text>
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.freeInfo || item.description || 'Sin descripción adicional.'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(item.id)}
          >
            <XCircle color="#FFF" size={18} />
            <Text style={styles.actionBtnText}>Rechazar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn, { backgroundColor: theme.primary }]}
            onPress={() => handleValidate(item.id)}
          >
            <CheckCircle color="#FFF" size={18} />
            <Text style={styles.actionBtnText}>Validar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.text }, typography.h2]}>Validaciones</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {pendingLocations.length} propuestas pendientes
          </Text>
        </View>
      </View>

      {pendingLocations.length > 0 ? (
        <FlatList
          data={pendingLocations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
            <Zap color={theme.textSecondary} size={40} opacity={0.3} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>¡Todo al día!</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            No hay nuevas ubicaciones pendientes de validación.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 24 },
  subtitle: { fontSize: 13, marginTop: 2 },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600'
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  rejectBtn: {
    backgroundColor: '#E74C3C',
  },
  approveBtn: {
    backgroundColor: '#2ECC71',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7
  }
});
