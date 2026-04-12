/**
 * error.middleware.js
 * 역할: 공통 에러를 JSON 응답으로 변환합니다.
 */
import { logger } from '../utils/logger.js';

export function errorMiddleware(err, _req, res, _next) {
  logger.error(err);

  return res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
}
