import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { COLORS } from './src/constants';
import AppNavigator from './src/navigation';
import { default as theme } from './src/theme.json';
import { default as mapping } from './src/mapping.json';
import { StateProvider } from './src/services/stateService';

export default function App() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Add global error handler
    const errorHandler = (error, isFatal) => {
      if (isFatal) {
        setHasError(true);
        setError(error);
      }
    };
    
    ErrorUtils.setGlobalHandler(errorHandler);
    
    return () => {
      // Reset error handler on unmount
      ErrorUtils.setGlobalHandler((error, isFatal) => {});
    };
  }, []);

  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong!</Text>
        <Text style={{ marginBottom: 20 }}>{error && error.message}</Text>
        <Text>Please restart the app.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider 
        {...eva} 
        customMapping={mapping} 
        theme={{ ...eva.dark, ...theme }}
      >
        <StatusBar backgroundColor={COLORS.BACKGROUND} />
        <StateProvider>
          <AppNavigator />
        </StateProvider>
      </ApplicationProvider>
    </View>
  );
}