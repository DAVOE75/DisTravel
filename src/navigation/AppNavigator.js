import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MapScreen } from '../screens/MapScreen';
import { CityDetailScreen } from '../screens/CityDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { DisabilityDetailScreen } from '../screens/DisabilityDetailScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { ToiletsScreen } from '../screens/ToiletsScreen';
import { SavingsSimulatorScreen } from '../screens/SavingsSimulatorScreen';
import { AddLocationScreen } from '../screens/AddLocationScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DistravelAIScreen } from '../screens/DistravelAIScreen';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { theme } = useTheme();
  const { userData, isLoading } = useUser();
  
  if (isLoading) return null; // O una pantalla de splash
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      {!userData?.isLoggedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CityDetail" component={CityDetailScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="DisabilityDetail" component={DisabilityDetailScreen} />
          <Stack.Screen name="Emergency" component={EmergencyScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Toilets" component={ToiletsScreen} />
          <Stack.Screen name="SavingsSimulator" component={SavingsSimulatorScreen} />
          <Stack.Screen name="AddLocation" component={AddLocationScreen} />
          <Stack.Screen name="DistravelAI" component={DistravelAIScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
