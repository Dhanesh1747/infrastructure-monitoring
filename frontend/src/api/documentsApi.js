import { apiClient } from './client';

export async function getDocuments() {
  const response = await apiClient.get('/documents');
  return response.data;
}

export async function getDocumentById(documentId) {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data;
}

export async function createDocument(data) {
  const payload = {
    projectId: Number(data.projectId),
    documentName: data.documentName,
    documentType: data.documentType,
    filePath: data.filePath,
    uploadedBy: Number(data.uploadedBy)
  };
  const response = await apiClient.post('/documents', payload);
  return response.data;
}

export async function updateDocument(documentId, data) {
  const payload = {
    projectId: Number(data.projectId),
    documentName: data.documentName,
    documentType: data.documentType,
    filePath: data.filePath,
    uploadedBy: Number(data.uploadedBy)
  };
  const response = await apiClient.patch(`/documents/${documentId}`, payload);
  return response.data;
}

export async function deleteDocument(documentId) {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response.data;
}
