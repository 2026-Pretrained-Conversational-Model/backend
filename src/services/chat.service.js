/**
 * chat.service.js
 * 역할: WebSocket으로 들어온 payload를 해석하고, 프론트와 호환되는 응답 JSON을 만듭니다.
 * 현재는 Python/SageMaker 연결 전이므로 mock 응답만 반환합니다.
 */
import { appendHistory, getOrCreateSession } from './session.service.js';

function buildTextResponse(content) {
  return {
    type: 'text',
    content,
  };
}

export function handleIncomingMessage(payload) {
  const { type, sessionId, content, fileId, fileName, additionalFiles } = payload || {};

  if (!sessionId) {
    return {
      ok: false,
      response: { type: 'error', content: 'sessionId가 없습니다.' },
    };
  }

  getOrCreateSession(sessionId);

  if (type === 'message') {
    appendHistory(sessionId, 'user', content || '');

    const reply = buildTextResponse(
      `메시지 수신 완료: "${content || ''}"\n현재는 Node.js baseline mock 응답입니다.`
    );
    appendHistory(sessionId, 'assistant', reply.content);

    return { ok: true, response: reply };
  }

  if (type === 'message_with_file') {
    appendHistory(sessionId, 'user', content || '', {
      fileId: fileId || null,
      fileName: fileName || null,
      additionalFiles: additionalFiles || [],
    });

    const extraCount = Array.isArray(additionalFiles) ? additionalFiles.length : 0;
    const reply = buildTextResponse(
      `파일 메시지 수신 완료\n- message: "${content || ''}"\n- fileId: ${fileId || '없음'}\n- fileName: ${fileName || '없음'}${extraCount > 0 ? `\n- additionalFiles: ${extraCount}개` : ''}\n현재는 Python 연결 전 mock 응답입니다.`
    );
    appendHistory(sessionId, 'assistant', reply.content);

    return { ok: true, response: reply };
  }

  return {
    ok: false,
    response: { type: 'error', content: `지원하지 않는 메시지 타입입니다: ${type}` },
  };
}
