/**
 * env.js
 * 역할: 환경변수를 로딩하고, 서버 전역 설정값을 export 합니다.
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 8080),
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 20),
};
