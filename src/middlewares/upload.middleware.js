/**
 * upload.middleware.js
 * 역할: multer를 이용해 multipart/form-data 파일 업로드를 처리합니다.
 */
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env.js';

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
});
