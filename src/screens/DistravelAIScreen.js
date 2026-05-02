import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { 
  ChevronLeft, 
  Bot, 
  Camera, 
  Sparkles, 
  Send, 
  ScanSearch,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Library,
  Info
} from 'lucide-react-native';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

export function DistravelAIScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'auditor', 'explorer'
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! Soy Distravel AI. ¿En qué puedo ayudarte hoy con tu viaje accesible?", sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [explorerResult, setExplorerResult] = useState(null);

  const [capturedImage, setCapturedImage] = useState(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages([...messages, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulación de respuesta de IA
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: "He analizado tu consulta. Para ese destino en Alcoy, te recomiendo el Hotel Serpis, tiene las mejores valoraciones en baños adaptados y una rampa de entrada certificada. ¿Quieres que te muestre la ruta?", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const startAnalysis = async () => {
    // 1. Pedir permisos y abrir cámara
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a la cámara para auditar la accesibilidad.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      // Simulación de análisis de imagen real
      setTimeout(() => {
        setAnalysisResult({
          score: 8.5,
          status: 'Accesibilidad Verificada',
          details: [
            { type: 'success', text: 'Ancho de puerta adecuado (90cm)' },
            { type: 'success', text: 'Suelo antideslizante detectado' },
            { type: 'warning', text: 'Barra de apoyo ligeramente alta' }
          ]
        });
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const startExploration = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a la cámara para identificar objetos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setIsAnalyzing(true);
      setExplorerResult(null);
      
      // Simulación de reconocimiento de monumento/objeto
      setTimeout(() => {
        setExplorerResult({
          name: 'Museo de Biodiversidad (Alcoy)',
          description: 'Antigua fábrica rehabilitada que alberga una colección única sobre fauna y flora mediterránea. Un ejemplo de arquitectura industrial del siglo XX.',
          history: 'Fundado en 2004 para la investigación y divulgación de la biodiversidad local.',
          accessInfo: 'Totalmente accesible, cuenta con ascensores panorámicos y maquetas táctiles para personas con discapacidad visual.'
        });
        setIsAnalyzing(false);
      }, 2500);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Sparkles color={theme.primary} size={20} />
          <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Distravel AI</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('chat')}
        >
          <Bot color={activeTab === 'chat' ? '#FFFFFF' : theme.textSecondary} size={18} />
          <Text style={[styles.tabText, { color: activeTab === 'chat' ? '#FFFFFF' : theme.textSecondary }]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'auditor' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('auditor')}
        >
          <ScanSearch color={activeTab === 'auditor' ? '#FFFFFF' : theme.textSecondary} size={18} />
          <Text style={[styles.tabText, { color: activeTab === 'auditor' ? '#FFFFFF' : theme.textSecondary }]}>Auditor</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'explorer' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('explorer')}
        >
          <Library color={activeTab === 'explorer' ? '#FFFFFF' : theme.textSecondary} size={18} />
          <Text style={[styles.tabText, { color: activeTab === 'explorer' ? '#FFFFFF' : theme.textSecondary }]}>Explorar</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex1}
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => (
              <View 
                key={msg.id} 
                style={[
                  styles.messageBubble, 
                  msg.sender === 'user' ? 
                  [styles.userBubble, { backgroundColor: theme.primary }] : 
                  [styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border }]
                ]}
              >
                <Text style={[styles.messageText, { color: msg.sender === 'user' ? '#FFFFFF' : theme.text }]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border, width: 60 }]}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputArea, { borderTopColor: theme.border }]}>
            <TextInput 
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface }]}
              placeholder="Pregúntame sobre accesibilidad..."
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={handleSend}>
              <Send color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.auditorContent}>
          <View style={[styles.cameraPlaceholder, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {isAnalyzing ? (
              <View style={styles.analyzingOverlay}>
                <Image source={{ uri: capturedImage }} style={styles.previewImg} />
                <View style={styles.scanLine} />
                <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                <Text style={[styles.analyzingText, { color: '#FFFFFF' }]}>Escaneando barreras...</Text>
              </View>
            ) : capturedImage ? (
              <Image 
                source={{ uri: capturedImage }} 
                style={styles.previewImg} 
              />
            ) : (
              <View style={styles.noPreview}>
                <Camera color={theme.textSecondary} size={48} />
                <Text style={[styles.noPreviewText, { color: theme.textSecondary }]}>Enfoca el lugar a analizar</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.analyzeBtn, { backgroundColor: theme.primary }]}
            onPress={startAnalysis}
            disabled={isAnalyzing}
          >
            <ScanSearch color="#FFFFFF" size={24} />
            <Text style={styles.analyzeBtnText}>Auditar ahora con IA</Text>
          </TouchableOpacity>

          {analysisResult && (
            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>Resultado del Análisis</Text>
                  <Text style={[styles.resultStatus, { color: theme.success }]}>{analysisResult.status}</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.scoreText, { color: theme.primary }]}>{analysisResult.score}</Text>
                </View>
              </View>
              
              <View style={styles.detailsList}>
                {analysisResult.details.map((detail, idx) => (
                  <View key={idx} style={styles.detailItem}>
                    {detail.type === 'success' ? 
                      <ShieldCheck color={theme.success} size={18} /> : 
                      <AlertTriangle color="#F1C40F" size={18} />
                    }
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>{detail.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.auditorContent}>
          <View style={[styles.cameraPlaceholder, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {isAnalyzing ? (
              <View style={styles.analyzingOverlay}>
                <Image source={{ uri: capturedImage }} style={styles.previewImg} />
                <View style={styles.scanLine} />
                <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                <Text style={[styles.analyzingText, { color: '#FFFFFF' }]}>Identificando...</Text>
              </View>
            ) : capturedImage ? (
              <Image source={{ uri: capturedImage }} style={styles.previewImg} />
            ) : (
              <View style={styles.noPreview}>
                <Library color={theme.textSecondary} size={48} />
                <Text style={[styles.noPreviewText, { color: theme.textSecondary }]}>Apunta a un edificio u objeto</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.analyzeBtn, { backgroundColor: theme.accent }]}
            onPress={startExploration}
            disabled={isAnalyzing}
          >
            <Sparkles color="#FFFFFF" size={24} />
            <Text style={styles.analyzeBtnText}>Identificar con IA</Text>
          </TouchableOpacity>

          {explorerResult && (
            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.resultTitle, { color: theme.text, marginBottom: 5 }]}>{explorerResult.name}</Text>
              <Text style={[styles.explorerDesc, { color: theme.textSecondary }]}>{explorerResult.description}</Text>
              
              <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                <Info color={theme.primary} size={16} />
                <Text style={[styles.infoBoxText, { color: theme.text }]}>Histora: {explorerResult.history}</Text>
              </View>

              <View style={[styles.infoBox, { backgroundColor: theme.success + '10' }]}>
                <Accessibility color={theme.success} size={16} />
                <Text style={[styles.infoBoxText, { color: theme.text }]}>Accesibilidad: {explorerResult.accessInfo}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 5,
    borderRadius: 15,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  auditorContent: {
    padding: 20,
  },
  cameraPlaceholder: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 25,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  noPreview: {
    alignItems: 'center',
  },
  noPreviewText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#00F2FF',
    top: '50%',
    shadowColor: '#00F2FF',
    shadowBlur: 10,
    shadowOpacity: 0.8,
  },
  analyzingText: {
    marginTop: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  analyzeBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
  },
  resultCard: {
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  scoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
  },
  explorerDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
});
