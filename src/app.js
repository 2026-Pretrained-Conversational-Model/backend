/**
 * app.js
 * 역할: Express 앱 초기 설정, 미들웨어 등록, REST 라우트 연결을 담당합니다.
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin === '*' ? true : env.clientOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/health', healthRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/uploads', express.static(path.resolve(__dirname, '..', env.uploadDir)));

  app.use(errorMiddleware);

  return app;
}
