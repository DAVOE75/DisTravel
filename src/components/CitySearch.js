import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Animated
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Search, X, MapPin } from 'lucide-react-native';
import municipios from '../data/municipios.json';

export function CitySearch({ onSelectCity }) {
  const { theme, isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 1) {
      const filtered = municipios
        .filter(m => m.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5);
      setResults(filtered);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelect = (city) => {
    setQuery(city);
    setShowResults(false);
    if (onSelectCity) onSelectCity(city);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Search color={theme.textSecondary} size={20} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="¿A dónde quieres ir?"
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => query.length > 1 && setShowResults(true)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X color={theme.textSecondary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {results.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.resultItem,
                { borderBottomColor: theme.border },
                index === results.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => handleSelect(item)}
            >
              <MapPin color={theme.primary} size={16} style={styles.resultIcon} />
              <Text style={[styles.resultText, { color: theme.text }]}>{item}</Text>
            </TouchableOpacity>
          ))}
          {results.length === 0 && query.length > 1 && (
            <View style={styles.emptyItem}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No se encontraron resultados</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    height: '100%',
  },
  resultsContainer: {
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    fontSize: 15,
  },
  emptyItem: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  }
});
