/**
 * DailyPlan App
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootTabs from './src/navigation/RootTabs';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
