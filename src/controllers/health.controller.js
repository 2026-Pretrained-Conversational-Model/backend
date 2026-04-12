/**
 * health.controller.js
 * 역할: 서버 상태 확인용 응답을 반환합니다.
 */
export function getHealth(_req, res) {
  res.json({
    ok: true,
    service: 'node-ws-backend',
    timestamp: new Date().toISOString(),
  });
}
