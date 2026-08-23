import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuthStore} from '../../auth/authStore';

/** 默认头像（本地静态资源，Metro 通过 require 解析） */
const DEFAULT_AVATAR = require('../../../asstes/img/user/d-avtive.png');
/** 默认昵称 */
const DEFAULT_NICKNAME = '皮卡丘';

/** 简约风配色：与登录页保持一致 */
const COLORS = {
  primary: '#FF7A30',
  bg: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#8A8A8A',
  danger: '#E5484D',
};

/** 我的页面：头像 + 昵称 + 退出登录 */
export default function ProfileScreen() {
  const logout = useAuthStore(s => s.logout);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 用户信息 */}
        <View style={styles.profile}>
          <Image source={DEFAULT_AVATAR} style={styles.avatar} />
          <View>
            <Text style={styles.nickname}>{DEFAULT_NICKNAME}</Text>
            <Text style={styles.subtitle}>记录每一天</Text>
          </View>
        </View>

        {/* 退出登录 */}
        <Pressable
          style={({pressed}) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="退出登录"
          onPress={logout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F4',
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
