import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  AlertTriangle, 
  Camera, 
  Send,
  Building2,
  Info,
  MapPin,
  TrendingDown
} from 'lucide-react-native';
import { typography } from '../theme/typography';

export function ReportScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { placeName } = route.params || {};
  const [reportType, setReportType] = useState('price');
  const [description, setDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('');

  const sendReport = () => {
    Alert.alert(
      'Ajuste Recibido',
      'Gracias por ayudar a mantener Distravel actualizado. Validaremos la información y la aplicaremos en breve.',
      [{ text: 'Entendido', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }, typography.h2]}>Ajustar Información</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {placeName && (
          <View style={[styles.placeBadge, { backgroundColor: theme.primary + '15' }]}>
            <MapPin color={theme.primary} size={16} />
            <Text style={[styles.placeBadgeText, { color: theme.primary }]}>{placeName}</Text>
          </View>
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>¿Qué ajuste quieres realizar?</Text>
        
        <View style={styles.typeGrid}>
          <TouchableOpacity 
            style={[
              styles.typeItem, 
              { backgroundColor: theme.surface, borderColor: reportType === 'price' ? theme.primary : theme.border }
            ]}
            onPress={() => setReportType('price')}
          >
            <TrendingDown color={reportType === 'price' ? theme.primary : theme.textSecondary} size={24} />
            <Text style={[styles.typeLabel, { color: theme.text }]}>Precio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.typeItem, 
              { backgroundColor: theme.surface, borderColor: reportType === 'discount' ? theme.primary : theme.border }
            ]}
            onPress={() => setReportType('discount')}
          >
            <Info color={reportType === 'discount' ? theme.primary : theme.textSecondary} size={24} />
            <Text style={[styles.typeLabel, { color: theme.text }]}>Descuento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.typeItem, 
              { backgroundColor: theme.surface, borderColor: reportType === 'barrier' ? theme.primary : theme.border }
            ]}
            onPress={() => setReportType('barrier')}
          >
            <AlertTriangle color={reportType === 'barrier' ? theme.primary : theme.textSecondary} size={24} />
            <Text style={[styles.typeLabel, { color: theme.text }]}>Barrera</Text>
          </TouchableOpacity>
        </View>

        {(reportType === 'price' || reportType === 'discount') && (
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nuevos Datos Detectados</Text>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <TextInput 
                  style={[styles.smallInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Nuevo Precio (€)"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={newPrice}
                  onChangeText={setNewPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput 
                  style={[styles.smallInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="% Descuento"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={newDiscount}
                  onChangeText={setNewDiscount}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Detalles adicionales</Text>
          <TextInput 
            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            placeholder="Explica el cambio o el problema para ayudar a otros viajeros..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={[styles.photoBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Camera color={theme.primary} size={24} />
          <Text style={[styles.photoBtnText, { color: theme.text }]}>Añadir foto del ajuste</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <MapPin color={theme.primary} size={20} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Usaremos tu ubicación para validar que te encuentras cerca del lugar.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: (description || newPrice) ? 1 : 0.6 }]} 
          onPress={sendReport}
          disabled={!(description || newPrice)}
        >
          <Send color="#FFFFFF" size={20} />
          <Text style={styles.submitBtnText}>Enviar Ajuste</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  placeBadgeText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInput: {
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  typeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  typeItem: {
    width: '31%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  typeLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 25,
  },
  textArea: {
    borderRadius: 20,
    padding: 15,
    height: 150,
    borderWidth: 1,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 25,
  },
  photoBtnText: {
    marginLeft: 12,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
  }
});
