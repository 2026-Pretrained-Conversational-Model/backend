/**
 * session.service.js
 * 역할: 세션 생성, 조회, 히스토리 추가를 담당합니다.
 */
import { getSession, hasSession, setSession } from '../repositories/session.store.js';

function buildEmptySession(sessionId) {
  return {
    sessionId,
    createdAt: new Date().toISOString(),
    history: [],
    uploadedFiles: [],
    userMemory: {},
    summary: '',
  };
}

export function getOrCreateSession(sessionId) {
  if (!sessionId) {
    throw new Error('sessionId is required');
  }

  if (!hasSession(sessionId)) {
    setSession(sessionId, buildEmptySession(sessionId));
  }

  return getSession(sessionId);
}

export function appendHistory(sessionId, role, content, extra = {}) {
  const session = getOrCreateSession(sessionId);
  session.history.push({
    role,
    content,
    timestamp: Date.now(),
    ...extra,
  });
  return session;
}

export function addUploadedFile(sessionId, fileMeta) {
  const session = getOrCreateSession(sessionId);
  session.uploadedFiles.push(fileMeta);
  return session;
}
