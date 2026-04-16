const fileMap = new Map();

export function saveUploadedFileMeta(fileMeta) {
  fileMap.set(fileMeta.fileId, fileMeta);
  return fileMeta;
}

export function getUploadedFileMeta(fileId) {
  return fileMap.get(fileId) || null;
}