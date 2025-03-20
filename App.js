import React from 'react';
import { StatusBar, View } from 'react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { COLORS } from './src/constants';
import AppNavigator from './src/navigation';
import { default as theme } from './src/theme.json';
import { default as mapping } from './src/mapping.json';
import { StateProvider } from './src/services/stateService';

export default function App() {
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