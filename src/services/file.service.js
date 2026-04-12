/**
 * file.service.js
 * 역할: 업로드 파일 정보를 프론트가 기대하는 응답 형식으로 가공합니다.
 */
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function buildUploadedFileResponse(file) {
  const fileId = uuidv4();
  return {
    fileId,
    fileName: file.originalname,
    fileUrl: `/uploads/${path.basename(file.path)}`,
    mimeType: file.mimetype,
    size: file.size,
    storedPath: file.path,
  };
}
