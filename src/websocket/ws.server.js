/**
 * ws.server.js
 * 역할: HTTP 서버에 WebSocket 업그레이드를 붙이고, /ws/chat 경로만 허용합니다.
 */
import { WebSocketServer } from 'ws';
import { WS_PATH } from './ws.events.js';
import { attachWsHandlers } from './ws.handler.js';
import { logger } from '../utils/logger.js';

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { url } = request;

    if (url !== WS_PATH) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      logger.info('WS client connected:', url);
      attachWsHandlers(ws);
    });
  });

  return wss;
}
