import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Linking,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  CreditCard, 
  Info, 
  Globe, 
  Phone, 
  Accessibility, 
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Clock3,
  Sparkles,
  Eye,
  Ear,
  Brain,
  Share2,
  Trash2,
  Save,
  X,
  Camera,
  PlusCircle,
  MinusCircle
} from 'lucide-react-native';
import { typography } from '../theme/typography';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { AutonomousCommunityMap } from '../components/AutonomousCommunityMap';
import { PROVINCE_TO_REGION } from '../data/provinces';

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const { width } = Dimensions.get('window');
const DAYS_MAP = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function PlaceDetailScreen({ route, navigation }) {
  const { place: navigationPlace } = route.params;
  const { theme, isDarkMode } = useTheme();
  const { userData, updateUserData } = useUser();
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  // Buscar la versión más fresca del lugar en las contribuciones (por ID o nombre+ciudad)
  const placeFromContext = (userData?.contributions || []).find(p => 
    p.id === navigationPlace.id || (p.name === navigationPlace.name && p.city === navigationPlace.city)
  );
  
  const initialPlace = placeFromContext || navigationPlace;

  const [isEditing, setIsEditing] = useState(false);
  const [place, setPlace] = useState(initialPlace);
  const [image, setImage] = useState(place.image || 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a');

  // Actualizar el estado local si el contexto cambia (por ejemplo, tras la migración de semillas)
  useEffect(() => {
    if (placeFromContext && !isEditing) {
      setPlace(placeFromContext);
      if (placeFromContext.image) {
        setImage(placeFromContext.image);
      }
    }
  }, [placeFromContext, isEditing]);

  const category = place.category || 'Monumento';
  const schedule = place.schedule || (place.morningOpen ? `${place.morningOpen} - ${place.morningClose}` : 'Consultar horario');
  
  const handleSave = () => {
    updateUserData('contributions', (prev) => {
      const existing = prev || [];
      const index = existing.findIndex(p => p.id === place.id || (p.name === initialPlace.name && p.city === initialPlace.city));
      if (index !== -1) {
        const updated = [...existing];
        updated[index] = { ...place, image };
        return updated;
      }
      return [...existing, { ...place, image }];
    });
    setIsEditing(false);
    Alert.alert("Éxito", "Cambios guardados correctamente.");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setImage(newUri);
      if (!isEditing) {
        // Si no está en modo edición, guardar solo la imagen
        updateUserData('contributions', (prev) => {
          const existing = prev || [];
          const index = existing.findIndex(p => p.id === place.id || (p.name === initialPlace.name && p.city === initialPlace.city));
          if (index !== -1) {
            const updated = [...existing];
            updated[index] = { ...updated[index], image: newUri };
            return updated;
          }
          return [...existing, { ...place, image: newUri }];
        });
        Alert.alert("Éxito", "Imagen actualizada.");
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Lugar",
      "¿Estás seguro de que deseas eliminar definitivamente este lugar? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => {
            updateUserData('contributions', (prev) => 
              (prev || []).filter(p => p.id !== place.id)
            );
            navigation.goBack();
          } 
        }
      ]
    );
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const dayName = DAYS_MAP[now.getDay()];
    const isOpenToday = place.openingDays ? place.openingDays[dayName] : true;
    
    if (!isOpenToday) return { status: 'closed_today', text: 'Cerrado hoy' };

    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const parseTime = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const nowMinutes = parseTime(currentTimeStr);
    
    let intervals = [];
    if (place.isSplitSchedule) {
      if (place.morningOpen && place.morningClose) intervals.push({ open: parseTime(place.morningOpen), close: parseTime(place.morningClose) });
      if (place.afternoonOpen && place.afternoonClose) intervals.push({ open: parseTime(place.afternoonOpen), close: parseTime(place.afternoonClose) });
    } else if (place.morningOpen && place.morningClose) {
      intervals.push({ open: parseTime(place.morningOpen), close: parseTime(place.morningClose) });
    } else if (place.schedule && place.schedule.includes('-')) {
      const parts = place.schedule.split('-').map(p => p.trim());
      if (parts.length === 2) {
        intervals.push({ open: parseTime(parts[0]), close: parseTime(parts[1]) });
      }
    }

    if (intervals.length === 0) return null;

    for (const interval of intervals) {
      if (nowMinutes >= interval.open && nowMinutes < interval.close) {
        const remaining = interval.close - nowMinutes;
        if (remaining <= 60) {
          return { status: 'closing_soon', text: `Cierra en ${remaining} min`, color: '#E74C3C' };
        }
        return { status: 'open', text: 'Abierto ahora', color: '#2ECC71' };
      }
    }

    return { status: 'closed', text: 'Cerrado ahora', color: '#95A5A6' };
  };

  const timeInfo = getTimeRemaining();

  const effectiveRegion = React.useMemo(() => {
    if (place.region) return place.region;
    if (place.province) return PROVINCE_TO_REGION[place.province] || place.province;
    return 'Castilla-La Mancha'; // Fallback por defecto si no hay datos
  }, [place.region, place.province]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: image }} style={styles.heroImage} />
          <View style={styles.overlay} />
          
          <View style={styles.heroMapOverlay}>
            <AutonomousCommunityMap 
              regionName={effectiveRegion} 
              cityCoords={place.location}
              width={140}
              height={140}
            />
          </View>

          <SafeAreaView style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.circleButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {isAdmin && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {isEditing ? (
                  <>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: '#2ECC71' }]}
                      onPress={handleSave}
                    >
                      <Save color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: '#E74C3C' }]}
                      onPress={() => {
                        setIsEditing(false);
                        setPlace(initialPlace);
                      }}
                    >
                      <X color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: 'rgba(231, 76, 60, 0.6)' }]}
                      onPress={handleDelete}
                    >
                      <Trash2 color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                      onPress={pickImage}
                    >
                      <Camera color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.circleButton, { backgroundColor: theme.primary }]}
                      onPress={() => setIsEditing(true)}
                    >
                      <Edit color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </SafeAreaView>

          <View style={styles.heroContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
              </View>
              
              {timeInfo && (
                <View style={[styles.timeBadge, { backgroundColor: 'rgba(0,0,0,0.6)', marginLeft: 10 }]}>
                  <Clock3 color={timeInfo.color || '#FFF'} size={14} />
                  <Text style={[styles.timeBadgeText, { color: timeInfo.color || '#FFF' }]}>{timeInfo.text}</Text>
                </View>
              )}
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.placeNameEdit, typography.h1]}
                value={place.name}
                onChangeText={(v) => setPlace({...place, name: v})}
                multiline
              />
            ) : (
              <Text style={[styles.placeName, typography.h1]}>{place.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre este lugar</Text>
            {isEditing ? (
              <TextInput
                style={[styles.descriptionEdit, { color: theme.textSecondary, borderColor: theme.border }]}
                value={place.description}
                onChangeText={(v) => setPlace({...place, description: v})}
                multiline
              />
            ) : (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {place.description || 'Este emblemático lugar es una parada obligatoria para cualquier visitante.'}
              </Text>
            )}
          </View>

          {/* Tourist Tip */}
          {(place.touristTip || isEditing) && (
            <View style={[styles.tipCard, { backgroundColor: isDarkMode ? 'rgba(241, 196, 15, 0.1)' : '#FEF9E7', borderColor: '#F1C40F' }]}>
              <Sparkles color="#F1C40F" size={20} />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: isDarkMode ? '#F1C40F' : '#D4AC0D' }]}>Tip Distravel</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.tipTextEdit, { color: theme.text }]}
                    value={place.touristTip}
                    onChangeText={(v) => setPlace({...place, touristTip: v})}
                    multiline
                    placeholder="Escribe un consejo para viajeros..."
                  />
                ) : (
                  <Text style={[styles.tipText, { color: theme.text }]}>{place.touristTip}</Text>
                )}
              </View>
            </View>
          )}

          {/* Accessibility Features Icons */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesibilidad Adaptada</Text>
            <View style={styles.accessRow}>
              {[
                { id: 'physical', icon: Accessibility, label: 'Física' },
                { id: 'visual', icon: Eye, label: 'Visual' },
                { id: 'auditory', icon: Ear, label: 'Auditiva' },
                { id: 'cognitive', icon: Brain, label: 'Cognitiva' }
              ].map(feat => {
                const isActive = place.accessibility?.[feat.id];
                return (
                  <TouchableOpacity 
                    key={feat.id}
                    disabled={!isEditing}
                    style={[styles.accessIconBox, { backgroundColor: isActive ? theme.primary : theme.surface }]}
                    onPress={() => setPlace({
                      ...place, 
                      accessibility: { ...place.accessibility, [feat.id]: !isActive }
                    })}
                  >
                    <feat.icon color={isActive ? '#FFF' : theme.textSecondary} size={22} />
                    <Text style={[styles.accessIconText, { color: isActive ? '#FFF' : theme.textSecondary }]}>{feat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Avisos Importantes (Critical Notices) */}
          {(place.importantNotices?.length > 0 || isEditing) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle color="#E74C3C" size={22} />
                <Text style={[styles.sectionTitle, { color: '#E74C3C', marginLeft: 10, marginBottom: 0 }]}>Avisos Importantes</Text>
                {isEditing && (
                  <TouchableOpacity 
                    style={{ marginLeft: 'auto' }}
                    onPress={() => setPlace({
                      ...place,
                      importantNotices: [...(place.importantNotices || []), "Nuevo aviso importante..."]
                    })}
                  >
                    <PlusCircle color="#E74C3C" size={24} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.noticesContainer, { backgroundColor: '#FDEDEC', borderColor: '#E74C3C' }]}>
                {(place.importantNotices || []).map((notice, idx) => (
                  <View key={idx} style={styles.noticeRow}>
                    {isEditing ? (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity onPress={() => {
                          const newNotices = [...place.importantNotices];
                          newNotices.splice(idx, 1);
                          setPlace({...place, importantNotices: newNotices});
                        }}>
                          <MinusCircle color="#E74C3C" size={18} />
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.noticeTextEdit, { color: '#C0392B' }]}
                          value={notice}
                          onChangeText={(v) => {
                            const newNotices = [...place.importantNotices];
                            newNotices[idx] = v;
                            setPlace({...place, importantNotices: newNotices});
                          }}
                          multiline
                        />
                      </View>
                    ) : (
                      <Text style={[styles.noticeText, { color: '#C0392B' }]}>• {notice}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Horarios y Calendario POR TEMPORADAS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Horarios por Temporada</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={{ marginLeft: 'auto' }}
                  onPress={() => setPlace({
                    ...place,
                    seasons: [...(place.seasons || []), { 
                      name: 'Nueva Temporada', 
                      period: 'Fechas...', 
                      weekday: '10:00 - 14:00 y 16:00 - 19:00',
                      weekend: '10:00 - 14:00'
                    }]
                  })}
                >
                  <PlusCircle color={theme.primary} size={24} />
                </TouchableOpacity>
              )}
            </View>

            {(place.seasons || []).map((season, sIdx) => (
              <View key={sIdx} style={[styles.seasonCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.removeSeasonBtn}
                    onPress={() => {
                      const newSeasons = [...place.seasons];
                      newSeasons.splice(sIdx, 1);
                      setPlace({...place, seasons: newSeasons});
                    }}
                  >
                    <X color="#E74C3C" size={16} />
                  </TouchableOpacity>
                )}
                
                <View style={styles.seasonHeader}>
                  {isEditing ? (
                    <View style={{ flex: 1 }}>
                      <TextInput 
                        style={[styles.seasonNameEdit, { color: theme.primary }]}
                        value={season.name}
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].name = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                      <TextInput 
                        style={[styles.seasonPeriodEdit, { color: theme.textSecondary }]}
                        value={season.period}
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].period = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                    </View>
                  ) : (
                    <View>
                      <Text style={[styles.seasonName, { color: theme.primary }]}>{season.name.toUpperCase()}</Text>
                      <Text style={[styles.seasonPeriod, { color: theme.textSecondary }]}>{season.period}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.seasonBody}>
                  <View style={styles.seasonRow}>
                    <Text style={[styles.seasonLabel, { color: theme.text }]}>Lunes a Sábado:</Text>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.seasonTimeEdit, { color: theme.text }]}
                        value={season.weekday}
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].weekday = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                    ) : (
                      <Text style={[styles.seasonTime, { color: theme.textSecondary }]}>{season.weekday}</Text>
                    )}
                  </View>
                  <View style={styles.seasonRow}>
                    <Text style={[styles.seasonLabel, { color: theme.text }]}>Domingos y Festivos:</Text>
                    {isEditing ? (
                      <TextInput 
                        style={[styles.seasonTimeEdit, { color: theme.text }]}
                        value={season.weekend}
                        onChangeText={(v) => {
                          const newSeasons = [...place.seasons];
                          newSeasons[sIdx].weekend = v;
                          setPlace({...place, seasons: newSeasons});
                        }}
                      />
                    ) : (
                      <Text style={[styles.seasonTime, { color: theme.textSecondary }]}>{season.weekend}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {(!place.seasons || place.seasons.length === 0) && (
              <View style={[styles.scheduleContainer, { backgroundColor: theme.surface }]}>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                  const isOpen = place.openingDays ? place.openingDays[day] : true;
                  const currentDaySchedule = place.schedule || (place.morningOpen ? `${place.morningOpen} - ${place.morningClose}` : 'Consultar horario');
                  
                  return (
                    <View key={day} style={styles.scheduleRow}>
                      <Text style={[styles.dayText, { color: theme.textSecondary }]}>{day}</Text>
                      <TouchableOpacity 
                        disabled={!isEditing}
                        style={{ flex: 1, alignItems: 'flex-end' }}
                        onPress={() => setPlace({
                          ...place,
                          openingDays: { ...(place.openingDays || {}), [day]: !isOpen }
                        })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={[styles.timeText, { color: isOpen ? theme.text : '#E74C3C', fontWeight: isOpen ? '700' : '400' }]}>
                            {isOpen ? currentDaySchedule : 'Cerrado'}
                          </Text>
                          {isEditing && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isOpen ? '#2ECC71' : '#E74C3C' }} />
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            
            <View style={styles.holidayNote}>
              <AlertTriangle color="#F1C40F" size={14} />
              <Text style={[styles.holidayText, { color: theme.textSecondary }]}>
                Los festivos pueden alterar estos horarios. Recomendamos verificar antes de viajar.
              </Text>
            </View>
          </View>

          {/* Tarifas Completas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard color={theme.primary} size={22} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>Tarifas y Entradas</Text>
              {isEditing && (
                <TouchableOpacity 
                  style={{ marginLeft: 'auto' }}
                  onPress={() => setPlace({
                    ...place,
                    tariffs: [...(place.tariffs || []), { id: Date.now(), label: 'Nueva Tarifa', price: '0 €' }]
                  })}
                >
                  <PlusCircle color={theme.primary} size={24} />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.tariffsContainer, { backgroundColor: theme.surface }]}>
              {place.tariffs && place.tariffs.length > 0 ? (
                place.tariffs.map((tariff, idx) => (
                  <View key={tariff.id || idx} style={styles.tariffRow}>
                    {isEditing ? (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity onPress={() => {
                          const newTariffs = [...place.tariffs];
                          newTariffs.splice(idx, 1);
                          setPlace({...place, tariffs: newTariffs});
                        }}>
                          <MinusCircle color="#E74C3C" size={20} />
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.tariffLabel, { color: theme.text, borderBottomWidth: 1, borderBottomColor: theme.border }]}
                          value={tariff.label}
                          onChangeText={(v) => {
                            const newTariffs = [...place.tariffs];
                            newTariffs[idx] = { ...tariff, label: v };
                            setPlace({...place, tariffs: newTariffs});
                          }}
                        />
                      </View>
                    ) : (
                      <Text style={[styles.tariffLabel, { color: theme.text }]}>{tariff.label}</Text>
                    )}
                    
                    <View style={[styles.priceTag, { backgroundColor: theme.primary + '20' }]}>
                      {isEditing ? (
                        <TextInput
                          style={[styles.priceEditInput, { color: theme.primary }]}
                          value={tariff.price}
                          onChangeText={(v) => {
                            const newTariffs = [...place.tariffs];
                            newTariffs[idx] = { ...tariff, price: v };
                            setPlace({...place, tariffs: newTariffs});
                          }}
                        />
                      ) : (
                        <Text style={[styles.priceText, { color: theme.primary }]}>{tariff.price}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.tariffRow}>
                  <Text style={[styles.tariffLabel, { color: theme.text }]}>Entrada General</Text>
                  <Text style={[styles.priceText, { color: theme.primary }]}>Gratis</Text>
                </View>
              )}
              <View style={styles.tariffDisclaimer}>
                <Info color={theme.textSecondary} size={14} />
                <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                  Los precios pueden variar en eventos especiales o visitas teatralizadas.
                </Text>
              </View>
            </View>
          </View>

          {/* Contact & Links */}
          <View style={styles.section}>
            {/* Basic Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MapPin color={theme.primary} size={20} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Dirección</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoValueInput, { color: theme.text, borderBottomColor: theme.primary }]}
                      value={place.address}
                      onChangeText={(v) => setPlace({ ...place, address: v })}
                      placeholder="Calle, Número, CP, Ciudad..."
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: theme.text }]}>{place.address || `${place.city}, ${place.province}`}</Text>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Phone color={theme.primary} size={20} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Teléfono de Reservas</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoValueInput, { color: theme.text, borderBottomColor: theme.primary }]}
                      value={place.phone}
                      onChangeText={(v) => setPlace({ ...place, phone: v })}
                      placeholder="+34 ..."
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => place.phone && Linking.openURL(`tel:${place.phone}`)}>
                      <Text style={[styles.infoValue, { color: place.phone ? theme.primary : theme.text, fontWeight: place.phone ? '700' : '500' }]}>
                        {place.phone || 'No disponible'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {place.website && (
                <View style={styles.infoRow}>
                  <Globe color={theme.primary} size={20} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Sitio Web</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(place.website.startsWith('http') ? place.website : `https://${place.website}`)}>
                      <Text style={[styles.infoValue, { color: theme.primary, fontWeight: '700' }]}>{place.website}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Location Map */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
            <View style={[styles.mapContainer, { backgroundColor: theme.surface, borderColor: theme.border, overflow: 'hidden' }]}>
              {place.location && place.location.latitude ? (
                <MapView
                  style={{ width: '100%', height: '100%' }}
                  userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
                  customMapStyle={isDarkMode ? DARK_MAP_STYLE : []}
                  initialRegion={{
                    latitude: Number(place.location.latitude),
                    longitude: Number(place.location.longitude),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                >
                  <Marker coordinate={{
                    latitude: Number(place.location.latitude),
                    longitude: Number(place.location.longitude),
                  }} />
                </MapView>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 }}>
                  <MapPin color={theme.textSecondary} size={32} />
                  <Text style={{ color: theme.textSecondary, marginTop: 10, textAlign: 'center' }}>Ubicación no disponible para este lugar</Text>
                </View>
              )}
            </View>
            
            <View style={styles.addressBar}>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {place.address || `${place.city}, ${place.province || ''}`}
              </Text>
              <TouchableOpacity 
                style={[styles.navBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  const lat = place.location?.latitude || 40.4168;
                  const lon = place.location?.longitude || -3.7038;
                  const label = encodeURI(place.name);
                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                  Linking.openURL(url);
                }}
              >
                <Navigation color="#FFF" size={18} />
                <Text style={styles.navBtnText}>Cómo llegar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Accessibility Detailed Section */}
          <View style={[styles.accessibilitySection, { backgroundColor: theme.surface }]}>
            <View style={styles.sectionHeader}>
              <Accessibility color={theme.primary} size={24} />
              <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 10, marginBottom: 0 }]}>
                Detalles de Accesibilidad
              </Text>
            </View>
            <Text style={[styles.accessibilityText, { color: theme.textSecondary }]}>
              {place.freeInfo || 'Lugar adaptado con rampas de acceso, baños adaptados y personal formado para asistencia.'}
            </Text>
            <View style={styles.checkList}>
              <View style={styles.checkItem}>
                <CheckCircle2 color="#2ECC71" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Acceso sin escalones</Text>
              </View>
              <View style={styles.checkItem}>
                <CheckCircle2 color="#2ECC71" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Ascensor panorámico</Text>
              </View>
              <View style={styles.checkItem}>
                <AlertTriangle color="#F1C40F" size={18} />
                <Text style={[styles.checkText, { color: theme.text }]}>Aviso previo recomendado</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroContainer: { height: 350, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  heroMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', // Centrado total
    alignItems: 'center',
  },
  headerActions: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, zIndex: 10 },
  circleButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 }, // Bajado un poco
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  timeBadgeText: { fontSize: 12, fontWeight: '700' },
  placeName: { color: '#FFFFFF', marginTop: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, fontSize: 32, fontWeight: '900' },
  mainContent: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24 },
  tipCard: { flexDirection: 'row', padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 25, gap: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  tipText: { fontSize: 14, lineHeight: 20 },
  accessRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  accessIconBox: { flex: 1, padding: 12, borderRadius: 15, alignItems: 'center', gap: 6 },
  accessIconText: { fontSize: 10, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  infoItem: { flex: 1, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 10, color: '#95A5A6', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  contactBtnText: { fontSize: 14, fontWeight: '700' },
  scheduleContainer: { padding: 15, borderRadius: 15, marginTop: 10 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  dayText: { fontSize: 14, fontWeight: '600' },
  timeText: { fontSize: 14 },
  holidayNote: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  holidayText: { fontSize: 12, fontStyle: 'italic' },
  tariffsContainer: { padding: 15, borderRadius: 15, marginTop: 10 },
  tariffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tariffLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  priceTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceText: { fontSize: 14, fontWeight: '800' },
  tariffDisclaimer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  disclaimerText: { fontSize: 12, fontStyle: 'italic' },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  addressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  accessibilitySection: { padding: 20, borderRadius: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  accessibilityText: { fontSize: 15, lineHeight: 24, marginBottom: 15 },
  checkList: { gap: 10 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 14, fontWeight: '600' },
  placeNameEdit: {
    color: '#FFFFFF',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  descriptionEdit: {
    fontSize: 15,
    lineHeight: 24,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  tipTextEdit: {
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  priceEditInput: {
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'center',
  },
  editScheduleBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  editScheduleInput: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  noticesContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  noticeTextEdit: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    padding: 4,
  },
  seasonCard: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  removeSeasonBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  seasonName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  seasonNameEdit: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 4,
  },
  seasonPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  seasonPeriodEdit: {
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  seasonBody: {
    marginTop: 15,
    gap: 10,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  seasonTime: {
    fontSize: 13,
  },
  seasonTimeEdit: {
    fontSize: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    minWidth: 120,
    textAlign: 'right',
  }
});
