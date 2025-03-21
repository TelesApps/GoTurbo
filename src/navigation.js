import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from './constants';

// Import screens (uncomment as you implement them)
import SplashScreen from './screens/splash';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import MapScreen from './screens/map';
import ServiceRequestScreen from './screens/serviceRequest';
import ServiceHistoryScreen from './screens/serviceHistory';
import AccountScreen from './screens/account';
import PrivacyScreen from './screens/privacy';
import HelpScreen from './screens/help';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          cardStyle: { backgroundColor: 'transparent' }, 
          animationEnabled: false,
          headerShown: false
        }} 
        initialRouteName="Splash"
      >
        {/* Uncomment these as you implement the screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
        <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;