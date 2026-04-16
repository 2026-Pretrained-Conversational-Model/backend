/**
 * ws.handler.js
 * 역할: 클라이언트 WebSocket 연결과 수신 메시지를 처리합니다.
 */
import { handleIncomingMessage } from '../services/chat.service.js';
import { logger } from '../utils/logger.js';

export function attachWsHandlers(ws) {
  ws.on('message', async (rawMessage) => {
    try {
      const text = rawMessage.toString();
      const payload = JSON.parse(text);
      logger.info('WS message received:', payload.type, payload.sessionId);

      const { response } = await handleIncomingMessage(payload);
      ws.send(JSON.stringify(response));
    } catch (error) {
      logger.error('WS message handling failed:', error.message);
      ws.send(JSON.stringify({
        type: 'error',
        content: `메시지 처리 중 오류가 발생했습니다: ${error.message}`,
      }));
    }
  });

  ws.on('close', () => {
    logger.info('WS client disconnected');
  });

  ws.on('error', (error) => {
    logger.error('WS client error:', error.message);
  });
}