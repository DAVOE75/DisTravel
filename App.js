import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  React.useEffect(() => {
    console.log('Distravel App v3.0.2 - REFRESHED');
  }, []);
  
  console.log('Distravel App v3.0.2 - REFRESHED');
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
