import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RecordsProvider} from './RecordsContext';
import {AccountingStackParamList} from './navigation/types';
import BillListScreen from './screens/BillListScreen';
import RecordEntryScreen from './screens/RecordEntryScreen';
import StatsScreen from './screens/StatsScreen';

const Stack = createNativeStackNavigator<AccountingStackParamList>();

/** 记账模块栈导航，作为根 Tab 的「账单」页内嵌使用 */
export default function AccountingApp() {
  return (
    <RecordsProvider>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="BillList" component={BillListScreen} />
        <Stack.Screen
          name="RecordEntry"
          component={RecordEntryScreen}
          options={{animation: 'slide_from_bottom', presentation: 'card'}}
        />
        <Stack.Screen name="Stats" component={StatsScreen} />
      </Stack.Navigator>
    </RecordsProvider>
  );
}
