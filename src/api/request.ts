/**
 * fetch 请求封装
 * - 统一拼接 baseURL、处理超时、解析 JSON、规范错误
 * - 后端接口契约对齐前，页面可用 mock 数据替代，仅替换调用处即可
 */
import {API_BASE_URL, DEFAULT_TIMEOUT_MS} from './config';
import {httpLogger} from '../utils/logger';

/** 请求序号：用于关联同一次请求的请求/响应日志 */
let requestSeq = 0;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  /** 查询参数，自动拼接到 URL */
  params?: Record<string, string | number | boolean | undefined>;
  /** 请求体，自动 JSON 序列化 */
  body?: unknown;
  /** 追加/覆盖请求头 */
  headers?: Record<string, string>;
  /** 超时时间（毫秒），默认取 DEFAULT_TIMEOUT_MS */
  timeoutMs?: number;
  /** 外部 AbortSignal，用于页面卸载时取消请求 */
  signal?: AbortSignal;
}

/** 统一错误对象，code 为 HTTP 状态码或约定错误码 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    /** 后端返回的原始错误数据，便于调试 */
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 获取鉴权 token：由鉴权 store 注入，保证读到最新 token */
let getAuthToken: () => string | null = () => null;
export function setAuthTokenGetter(getter: () => string | null) {
  getAuthToken = getter;
}

/** 401 回调：token 过期时由鉴权 store 注入登出逻辑，触发重定向到登录页 */
let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = `${API_BASE_URL}${path}`;
  if (!params) return url;
  const search = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&');
  return search ? `${url}?${search}` : url;
}

async function parseResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    params,
    body,
    headers = {},
    timeoutMs,
    signal,
  } = options;

  // 超时控制：到点主动 abort，外部 signal 也会触发同一个 controller
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  if (signal) {
    if (signal.aborted) controller.abort();
    else
      signal.addEventListener('abort', () => controller.abort(), {once: true});
  }

  const token = getAuthToken();
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? {'Content-Type': 'application/json'} : {}),
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
    ...headers,
  };

  const seq = ++requestSeq;
  const tag = `#${seq} ${method} ${path}`;
  const startTime = Date.now();
  httpLogger.debug(`→ ${tag}`, {
    url: buildUrl(path, params),
    ...(body !== undefined ? {body} : {}),
  });

  try {
    console.log(buildUrl(path, params), 'buildUrl(path, params)');

    const res = await fetch(buildUrl(path, params), {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await parseResponse(res);
    const duration = Date.now() - startTime;

    if (!res.ok) {
      // 401：token 缺失/过期，统一登出（App 会重定向到登录页）
      if (res.status === 401) onUnauthorized();
      const message =
        (data as {message?: string} | null)?.message ??
        `请求失败（${res.status}）`;
      httpLogger.warn(`← ${tag} ${res.status} (${duration}ms)`, {
        error: message,
        data,
      });
      throw new ApiError(res.status, message, data);
    }
    httpLogger.info(`← ${tag} ${res.status} (${duration}ms)`, {data});
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const duration = Date.now() - startTime;
    if (err instanceof Error && err.name === 'AbortError') {
      const message = signal?.aborted ? '请求已取消' : '请求超时';
      httpLogger.warn(`✗ ${tag} ${message} (${duration}ms)`);
      throw new ApiError(-1, message);
    }
    console.log(err, 'err');

    httpLogger.error(`✗ ${tag} 网络异常 (${duration}ms)`, err);
    throw new ApiError(-2, '网络异常，请检查网络连接');
  } finally {
    clearTimeout(timer);
  }
}

/** 便捷方法 */
export const http = {
  get: <T>(
    path: string,
    params?: RequestOptions['params'],
    options?: RequestOptions,
  ) => request<T>(path, {...options, method: 'GET', params}),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {...options, method: 'POST', body}),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {...options, method: 'PUT', body}),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {...options, method: 'PATCH', body}),
  delete: <T>(
    path: string,
    params?: RequestOptions['params'],
    options?: RequestOptions,
  ) => request<T>(path, {...options, method: 'DELETE', params}),
};
