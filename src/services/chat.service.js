/**
 * chat.service.js
 * 역할: WebSocket으로 들어온 payload를 해석하고, 프론트와 호환되는 응답 JSON을 만듭니다.
 *
 * v2 변경:
 * - file_path를 직접 전달하는 대신, uploadFile()로 파일 바이트를 전송.
 *   AI Orchestrator가 별도 서버(RunPod)에 있어도 파일 전달 가능.
 * - 흐름: uploadFile(multipart) → /upload 으로 PDF 전송
 *         → requestChat(JSON) → /chat 으로 텍스트만 전송
 *         (ai-orchestrator 세션에 이미 PDF가 부착된 상태)
 */
import { appendHistory, getOrCreateSession } from './session.service.js';
import { getUploadedFileMeta } from '../repositories/file-meta.store.js';
import { requestChat, uploadFile } from '../config/ai.client.js';
import { logger } from '../utils/logger.js';

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

      // ── PDF 파일이면 ai-orchestrator에 multipart로 전송 ──
      if (primaryFile?.storedPath && primaryFile?.fileName?.toLowerCase().endsWith('.pdf')) {
        try {
          logger.info('Uploading PDF to ai-orchestrator:', primaryFile.fileName);
          await uploadFile(sessionId, primaryFile.storedPath, primaryFile.fileName);
          logger.info('PDF upload complete:', primaryFile.fileName);
        } catch (uploadErr) {
          logger.error('PDF upload failed:', uploadErr.message);
          return {
            ok: false,
            response: buildErrorResponse(`PDF 업로드 실패: ${uploadErr.message}`),
          };
        }
      }

      // ── 채팅 요청 (file_path 없이 — 이미 세션에 PDF 부착됨) ──
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