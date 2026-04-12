/**
 * logger.js
 * 역할: 공통 로그 출력 유틸입니다.
 */
export const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};
