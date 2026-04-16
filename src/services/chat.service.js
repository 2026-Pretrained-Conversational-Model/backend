/**
 * chat.service.js
 * 역할: WebSocket으로 들어온 payload를 해석하고, 프론트와 호환되는 응답 JSON을 만듭니다.
 * 현재는 Python/SageMaker 연결 전이므로 mock 응답만 반환합니다.
 */
import { appendHistory, getOrCreateSession } from './session.service.js';
import { getUploadedFileMeta } from '../repositories/file-meta.store.js';
import { requestChat } from '../config/ai.client.js';

function buildTextResponse(content) {
  return {
    type: 'text',
    content,
  };
}

function buildErrorResponse(content) {
  return {
    type: 'error',
    content,
  };
}

function normalizeAiAnswer(aiResponse) {
  return buildTextResponse(aiResponse?.answer || 'AI 응답이 비어 있습니다.');
}

function resolvePrimaryFile(fileId, fileName) {
  if (!fileId) return null;

  const meta = getUploadedFileMeta(fileId);
  if (!meta) {
    throw new Error(`업로드 파일 메타를 찾을 수 없습니다. fileId=${fileId}`);
  }

  return {
    fileId,
    fileName: fileName || meta.fileName,
    storedPath: meta.storedPath,
    mimeType: meta.mimeType,
  };
}

export async function handleIncomingMessage(payload) {
  const { type, sessionId, content, fileId, fileName, additionalFiles } = payload || {};

  if (!sessionId) {
    return {
      ok: false,
      response: buildErrorResponse('sessionId가 없습니다.'),
    };
  }

  getOrCreateSession(sessionId);

  try {
    if (type === 'message') {
      appendHistory(sessionId, 'user', content || '');

      const aiResponse = await requestChat({
        session_id: sessionId,
        user_text: content || '',
      });

      const reply = normalizeAiAnswer(aiResponse);

      appendHistory(sessionId, 'assistant', reply.content, {
        answerType: aiResponse?.answer_type || null,
        expired: aiResponse?.expired || false,
        expireReason: aiResponse?.expire_reason || null,
      });

      return { ok: true, response: reply };
    }

    if (type === 'message_with_file') {
      const primaryFile = resolvePrimaryFile(fileId, fileName);
      const extras = Array.isArray(additionalFiles) ? additionalFiles : [];

      appendHistory(sessionId, 'user', content || '', {
        fileId: primaryFile?.fileId || null,
        fileName: primaryFile?.fileName || null,
        storedPath: primaryFile?.storedPath || null,
        additionalFiles: extras,
      });

      const aiPayload = {
        session_id: sessionId,
        user_text: content || '',
      };

      if (primaryFile?.storedPath && primaryFile?.fileName?.toLowerCase().endsWith('.pdf')) {
        aiPayload.file_path = primaryFile.storedPath;
        aiPayload.file_name = primaryFile.fileName;
      }

      const aiResponse = await requestChat(aiPayload);
      const reply = normalizeAiAnswer(aiResponse);

      appendHistory(sessionId, 'assistant', reply.content, {
        answerType: aiResponse?.answer_type || null,
        expired: aiResponse?.expired || false,
        expireReason: aiResponse?.expire_reason || null,
      });

      return { ok: true, response: reply };
    }

    return {
      ok: false,
      response: buildErrorResponse(`지원하지 않는 메시지 타입입니다: ${type}`),
    };
  } catch (error) {
    return {
      ok: false,
      response: buildErrorResponse(`AI 처리 중 오류가 발생했습니다: ${error.message}`),
    };
  }
}