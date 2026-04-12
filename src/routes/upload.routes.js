/**
 * upload.routes.js
 * 역할: 프론트의 FILE_UPLOAD_URL(/api/upload)에 대응하는 업로드 라우트입니다.
 */
import { Router } from 'express';
import { uploadSingleFile } from '../controllers/upload.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();
router.post('/', upload.single('file'), uploadSingleFile);

export default router;
