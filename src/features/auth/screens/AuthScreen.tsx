import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuthStore} from '../authStore';

/** 表单模式 */
type AuthMode = 'login' | 'register';

/** 邮箱格式粗校验 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 简约风配色：白底 + 中性灰，品牌橙只用于关键操作与激活态 */
const COLORS = {
  primary: '#FF7A30',
  bg: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#8A8A8A',
  inputBg: '#F5F5F4',
  danger: '#E5484D',
};

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}

/** 输入框：浅灰填充无边框，聚焦时描边高亮 */
function AuthInput({
  placeholder,
  value,
  onChangeText,
  editable = true,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, focused && styles.inputFocused]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textSecondary}
      accessibilityLabel={placeholder}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

/** 登录/注册页 */
export default function AuthScreen() {
  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const validate = (): string | null => {
    if (!email.trim()) return '请输入邮箱';
    if (!EMAIL_RE.test(email.trim())) return '邮箱格式不正确';
    if (!password) return '请输入密码';
    if (password.length < 6) return '密码至少 6 位';
    if (!isLogin && !nickname.trim()) return '请输入昵称';
    return null;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({email: email.trim(), password});
      } else {
        await register({
          email: email.trim(),
          password,
          nickname: nickname.trim(),
        });
      }
      // 成功后由 authStore 的 token 变化切换到主界面，无需处理
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);
  };

  const title = useMemo(() => (isLogin ? '欢迎回来' : '创建账号'), [isLogin]);
  const subtitle = useMemo(
    () => (isLogin ? '登录后继续你的每日计划' : '一个账号，记录每一天'),
    [isLogin],
  );

  const tabs: {key: AuthMode; label: string}[] = [
    {key: 'login', label: '登录'},
    {key: 'register', label: '注册'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>DailyPlan</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* 登录/注册切换：文字 + 下划线指示器 */}
          <View style={styles.tabs}>
            {tabs.map(tab => {
              const active = tab.key === mode;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.tabItem}
                  accessibilityRole="button"
                  accessibilityState={{selected: active}}
                  hitSlop={8}
                  onPress={() => switchMode(tab.key)}
                  disabled={submitting}>
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  <View
                    style={[
                      styles.tabIndicator,
                      active && styles.tabIndicatorActive,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.form}>
            <AuthInput
              placeholder="邮箱"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
            />
            {!isLogin && (
              <AuthInput
                placeholder="昵称"
                value={nickname}
                onChangeText={setNickname}
                editable={!submitting}
              />
            )}
            <AuthInput
              placeholder="密码"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={({pressed}) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                submitting && styles.submitButtonDisabled,
              ]}
              accessibilityRole="button"
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>
                  {isLogin ? '登录' : '注册并登录'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    color: COLORS.primary,
  },
  title: {
    marginTop: 24,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  tabs: {
    marginTop: 40,
    flexDirection: 'row',
    gap: 24,
  },
  tabItem: {
    paddingBottom: 2,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  tabIndicator: {
    marginTop: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  form: {
    marginTop: 32,
    gap: 12,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
  },
  submitButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
