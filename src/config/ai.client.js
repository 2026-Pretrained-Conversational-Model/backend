/**
 * ai.client.js
 * 역할: AI Orchestrator(FastAPI)와의 HTTP 통신 클라이언트.
 *
 * v2 변경:
 * - uploadFile() 추가: PDF를 multipart로 /upload 엔드포인트에 전송.
 *   AI Orchestrator가 별도 서버(RunPod)에 있을 때 파일을 네트워크로 전달.
 */
import fs from 'fs';
import axios from 'axios';
import { env } from './env.js';

const http = axios.create({
  baseURL: env.aiOrchestratorUrl,
  timeout: env.aiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function requestChat(payload) {
  const { data } = await http.post('/chat', payload);
  return data;
}

/**
 * PDF 파일을 AI Orchestrator의 /upload 엔드포인트로 multipart 전송.
 * ai-orchestrator가 세션에 PDF를 부착하고 인덱싱을 시작한다.
 *
 * @param {string} sessionId - 세션 ID
 * @param {string} filePath  - 로컬 디스크의 파일 경로
 * @param {string} fileName  - 원본 파일명
 * @returns {Promise<object>} - { file_id, page_count, ingest_status, ready }
 */
export async function uploadFile(sessionId, filePath, fileName) {
  // Node.js에서 multipart/form-data 전송 — axios가 자동으로 boundary 생성
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('session_id', sessionId);
  form.append('file', fs.createReadStream(filePath), fileName);

  const { data } = await http.post('/upload', form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return data;
}