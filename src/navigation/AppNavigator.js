import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import MapScreen from '../screens/MapScreen';
import { CityDetailScreen } from '../screens/CityDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { DisabilityDetailScreen } from '../screens/DisabilityDetailScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { ToiletsScreen } from '../screens/ToiletsScreen';
import { SavingsSimulatorScreen } from '../screens/SavingsSimulatorScreen';
import AddLocationScreen from '../screens/AddLocationScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DistravelAIScreen } from '../screens/DistravelAIScreen';
import { DigitalWalletScreen } from '../screens/DigitalWalletScreen';
import { HowToUseScreen } from '../screens/HowToUseScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { MedalsScreen } from '../screens/MedalsScreen';
import { AdminValidationsScreen } from '../screens/AdminValidationsScreen';
import { SocialScreen } from '../screens/SocialScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import { useTheme } from '../theme/ThemeContext';
import { useUser } from '../context/UserContext';

const Stack = createStackNavigator();

function AuthenticatedStack() {
  const { theme } = useTheme();
  const { userData } = useUser();
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.background },
        }}
      >
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
        <Stack.Screen name="DigitalWallet" component={DigitalWalletScreen} />
        <Stack.Screen name="HowToUse" component={HowToUseScreen} />
        <Stack.Screen name="Medals" component={MedalsScreen} />
        <Stack.Screen name="AdminValidations" component={AdminValidationsScreen} />
        <Stack.Screen name="Social" component={SocialScreen} />
        <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      </Stack.Navigator>
    </View>
  );
}

export default function AppNavigator() {
  const { userData, isLoading } = useUser();
  
  if (isLoading) return <SplashScreen />;
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userData?.isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthenticatedStack} />
      )}
    </Stack.Navigator>
  );
}
