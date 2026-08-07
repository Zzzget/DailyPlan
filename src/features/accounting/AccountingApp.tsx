import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RecordsProvider} from './RecordsContext';
import {AccountingStackParamList} from './navigation/types';
import BillListScreen from './screens/BillListScreen';
import RecordEntryScreen from './screens/RecordEntryScreen';
import StatsScreen from './screens/StatsScreen';

const Stack = createNativeStackNavigator<AccountingStackParamList>();

export default function AccountingApp() {
  return (
    <SafeAreaProvider>
      <RecordsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="BillList" component={BillListScreen} />
            <Stack.Screen
              name="RecordEntry"
              component={RecordEntryScreen}
              options={{animation: 'slide_from_bottom', presentation: 'card'}}
            />
            <Stack.Screen name="Stats" component={StatsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </RecordsProvider>
    </SafeAreaProvider>
  );
}
