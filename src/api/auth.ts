/**
 * 认证相关接口
 * 对应后端：
 * - POST /auth/register  注册 { email, password, nickname }
 * - POST /auth/login     登录 { email, password }
 * - GET  /auth/me        获取当前用户（Bearer Token）
 */
import {http} from './request';

export interface RegisterParams {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

/** 当前登录用户信息（/auth/me 返回，字段以后端为准做宽松解析） */
export interface AuthUser {
  id?: string | number;
  email?: string;
  nickname?: string;
  [key: string]: unknown;
}

/**
 * 从登录响应中宽松提取 token。
 * 兼容常见字段：access_token / accessToken / token，
 * 以及包裹一层 data 的情况（{ data: { access_token } }）。
 */
function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;
  const candidates = [obj, (obj.data as Record<string, unknown>) ?? {}];
  for (const c of candidates) {
    const token = c.access_token ?? c.accessToken ?? c.token;
    if (typeof token === 'string' && token) return token;
  }
  return null;
}

/** 注册，返回后端原始响应 */
export function register(params: RegisterParams): Promise<unknown> {
  console.log('danzhili');

  return http.post('/auth/register', params);
}

/** 登录，返回提取出的 token；提取不到时抛错 */
export async function login(params: LoginParams): Promise<string> {
  const res = await http.post('/auth/login', params);
  const token = extractToken(res);
  if (!token) {
    throw new Error('登录响应中未找到 token');
  }
  return token;
}

/** 获取当前登录用户信息（需已携带 token） */
export function fetchMe(): Promise<AuthUser> {
  return http.get<AuthUser>('/auth/me');
}
