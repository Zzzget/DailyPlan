/**
 * 鉴权状态（Zustand + AsyncStorage 持久化）
 * - token 通过 persist 中间件写入本地存储，App 启动自动恢复
 * - request 层接到 token getter / 401 回调注入，避免循环依赖
 */
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../../api/auth';
import {setAuthTokenGetter, setUnauthorizedHandler} from '../../api/request';
import {enableStoreLog} from '../../utils/logger';

interface AuthState {
  /** 当前 token，null 表示未登录；由 persist 从本地存储恢复 */
  token: string | null;
  /** 登录：成功后保存 token（自动持久化） */
  login: (params: authApi.LoginParams) => Promise<void>;
  /** 注册：成功后用同一凭据自动登录 */
  register: (params: authApi.RegisterParams) => Promise<void>;
  /** 登出：清空本地 token */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      login: async params => {
        const token = await authApi.login(params);
        set({token});
      },
      register: async params => {
        // await authApi.fetchMe()
        await authApi.register(params);
        // 注册接口不返回 token，用同一凭据自动登录
        const token = await authApi.login({
          email: params.email,
          password: params.password,
        });
        set({token});
      },
      logout: () => set({token: null}),
    }),
    {
      name: 'dailyplan-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化 token，行为函数留在内存中
      partialize: state => ({token: state.token}),
    },
  ),
);

// 桥接请求层：请求头携带 token；接口返回 401（token 过期）时登出并回到登录页
setAuthTokenGetter(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => useAuthStore.getState().logout());

// 打印鉴权状态变更（含启动时 hydration 恢复；token 会被日志模块脱敏）
enableStoreLog('Auth', useAuthStore);
