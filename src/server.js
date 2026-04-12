/**
 * server.js
 * 역할: Express HTTP 서버를 실행하고 WebSocket 서버를 함께 붙입니다.
 */
import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { setupWebSocketServer } from './websocket/ws.server.js';
import { logger } from './utils/logger.js';

const app = createApp();
const server = http.createServer(app);

setupWebSocketServer(server);

server.listen(env.port, () => {
  logger.info(`HTTP server listening on http://localhost:${env.port}`);
  logger.info(`WebSocket server listening on ws://localhost:${env.port}/ws/chat`);
});
