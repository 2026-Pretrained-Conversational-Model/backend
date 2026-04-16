/**
 * upload.controller.js
 * 역할: 업로드된 파일을 저장하고 프론트 api.js가 기대하는 JSON을 반환합니다.
 */
import { buildUploadedFileResponse } from '../services/file.service.js';
import { saveUploadedFileMeta } from '../repositories/file-meta.store.js';

export function uploadSingleFile(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: '파일이 없습니다.',
    });
  }

  const result = buildUploadedFileResponse(req.file);
  saveUploadedFileMeta(result);

  return res.status(201).json(result);
}