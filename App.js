import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
