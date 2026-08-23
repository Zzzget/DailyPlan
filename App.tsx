/**
 * DailyPlan App
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootTabs from './src/navigation/RootTabs';
import AuthScreen from './src/features/auth/screens/AuthScreen';
import {useAuthStore} from './src/features/auth/authStore';

/** 根据登录状态切换：未登录进登录/注册页，已登录进主界面 */
function Root() {
  const token = useAuthStore(s => s.token);
  // AsyncStorage 恢复是异步的：hydration 完成前先展示 loading，避免闪现登录页
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );

    setHydrated(true);
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#FF7A30" />
      </View>
    );
  }

  return token ? <RootTabs /> : <AuthScreen />;
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Root />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F2',
  },
});

export default App;
