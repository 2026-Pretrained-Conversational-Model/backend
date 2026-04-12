/**
 * session.store.js
 * 역할: 세션 데이터를 메모리(Map)에 저장하는 아주 단순한 저장소입니다.
 */
const sessions = new Map();

export function getSession(sessionId) {
  return sessions.get(sessionId);
}

export function setSession(sessionId, sessionData) {
  sessions.set(sessionId, sessionData);
  return sessionData;
}

export function hasSession(sessionId) {
  return sessions.has(sessionId);
}
