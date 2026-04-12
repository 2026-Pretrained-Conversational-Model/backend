/**
 * health.routes.js
 * 역할: 헬스체크 라우트를 등록합니다.
 */
import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();
router.get('/', getHealth);

export default router;
