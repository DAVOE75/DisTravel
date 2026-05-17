import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  ShieldCheck,
  User,
  Star,
  Sparkles
} from 'lucide-react-native';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { typography } from '../theme/typography';

export function SocialScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { userData } = useUser();
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('@distravel_social_feed');
      if (cachedData) {
        setFeed(JSON.parse(cachedData));
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/api/social/feed`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setFeed(data);
        await AsyncStorage.setItem('@distravel_social_feed', JSON.stringify(data));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Error fetching social feed (posiblemente offline):', error);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const renderPost = ({ item }) => {
    const isVerified = item.verified || item.verifiedStatus === 'Verificado' || item.extra_data?.verifiedByCommunity?.status === 'Alta Confianza';
    
    return (
      <View style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* User Header */}
        <View style={styles.postHeader}>
          <View style={[styles.userAvatar, { backgroundColor: theme.primary + '20' }]}>
            {item.user_avatar ? (
              <Image source={{ uri: item.user_avatar }} style={styles.userAvatar} />
            ) : (
              <User size={20} color={theme.primary} />
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: theme.text }]}>{item.user_name || 'Colaborador Distravel'}</Text>
              {isVerified && <ShieldCheck size={14} color="#3498DB" style={{ marginLeft: 4 }} />}
            </View>
            <Text style={[styles.postLocation, { color: theme.textSecondary }]}>en {item.city}</Text>
          </View>
          <TouchableOpacity style={styles.moreOptions}>
            <Text style={{ color: theme.textSecondary }}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PlaceDetail', { place: item })}
        >
          <Image source={{ uri: item.image }} style={styles.postImage} />
        </TouchableOpacity>

        <View style={styles.postContent}>
          <View style={styles.actionRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Heart size={24} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MessageCircle size={24} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Share2 size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={16} color="#F1C40F" fill="#F1C40F" />
              <Text style={[styles.ratingText, { color: theme.text }]}>5.0</Text>
            </View>
          </View>

          <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.postDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          {item.accessibility && (
            <View style={styles.tagsRow}>
              {item.accessibility.physical && <View style={[styles.tag, { backgroundColor: '#3498DB20' }]}><Text style={{ color: '#3498DB', fontSize: 10, fontWeight: '800' }}>FÍSICA OK</Text></View>}
              {item.accessibility.visual && <View style={[styles.tag, { backgroundColor: '#8E44AD20' }]}><Text style={{ color: '#8E44AD', fontSize: 10, fontWeight: '800' }}>VISUAL OK</Text></View>}
            </View>
          )}

          <Text style={[styles.postTime, { color: theme.textSecondary }]}>HACE 2 HORAS</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Comunidad</Text>
          <View style={[styles.liveBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.aiBtn}>
          <Sparkles color={theme.primary} size={24} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando feed social...</Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          renderItem={renderPost}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.textSecondary }}>No hay publicaciones recientes.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#070B14',
    fontSize: 10,
    fontWeight: '900',
  },
  backBtn: { padding: 5 },
  aiBtn: { padding: 5 },
  feedList: { padding: 15 },
  postCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  postLocation: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreOptions: {
    padding: 5,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    padding: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  postTime: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  }
});
