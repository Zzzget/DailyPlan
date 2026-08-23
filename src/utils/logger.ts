/**
 * 统一日志模块
 * - 格式：[HH:mm:ss.SSS] [LEVEL] [模块] 消息 {数据}
 * - 内置 HTTP（网络请求）/ Store（全局状态）两个分类 logger
 * - 敏感字段（token / password 等）自动脱敏
 * - 生产环境只输出 warn / error，开发环境输出全部
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/** 生产环境静默 debug/info，避免刷屏和泄露数据 */
const MIN_LEVEL: LogLevel = __DEV__ ? 'debug' : 'warn';

/** 需要脱敏的字段名（不区分大小写，含子串即命中） */
const SENSITIVE_KEY_PATTERN = /token|password|secret|authorization|cookie/i;
const MASK = '***';

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

/** HH:mm:ss.SSS */
function timestamp(): string {
  const d = new Date();
  return (
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${pad(d.getMilliseconds(), 3)}`
  );
}

/** 递归脱敏：命中敏感字段名的值替换为 ***，循环引用/深层对象做防御处理 */
export function maskSensitive(data: unknown, depth = 0): unknown {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return depth >= 3
      ? '[Array]'
      : data.map(item => maskSensitive(item, depth + 1));
  }
  if (typeof data === 'object') {
    if (depth >= 3) return '[Object]';
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? MASK
        : maskSensitive(value, depth + 1);
    }
    return out;
  }
  return data;
}

export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

const CONSOLE_METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

/** 创建带模块标签的 logger */
export function createLogger(module: string): Logger {
  const log = (level: LogLevel, message: string, data?: unknown) => {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return;
    const prefix = `[${timestamp()}] [${level
      .toUpperCase()
      .padEnd(5)}] [${module}]`;
    if (data !== undefined) {
      // eslint-disable-next-line no-console
      console[CONSOLE_METHOD[level]](
        `${prefix} ${message}`,
        maskSensitive(data),
      );
    } else {
      // eslint-disable-next-line no-console
      console[CONSOLE_METHOD[level]](`${prefix} ${message}`);
    }
  };
  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
  };
}

/** 网络请求日志 */
export const httpLogger = createLogger('HTTP');

/** 全局状态变更日志 */
export const storeLogger = createLogger('Store');

/**
 * 订阅 Zustand store，打印每次状态变更的 diff（仅列出变化的字段）。
 * 基于 subscribe 实现，persist 恢复（hydration）触发的变更也能捕获。
 * 返回取消订阅函数。
 */
export function enableStoreLog<T extends object>(
  name: string,
  store: {
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  },
): () => void {
  return store.subscribe((state, prev) => {
    const diff: Record<string, {from: unknown; to: unknown}> = {};
    for (const key of Object.keys(state)) {
      const from = (prev as Record<string, unknown>)[key];
      const to = (state as Record<string, unknown>)[key];
      // 跳过函数（action）和引用未变的字段
      if (typeof to === 'function' || Object.is(from, to)) continue;
      diff[key] = {from, to};
    }
    if (Object.keys(diff).length > 0) {
      storeLogger.debug(`${name} 状态变更`, diff);
    }
  });
}
