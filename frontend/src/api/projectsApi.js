import { apiClient } from './client';

export async function getProjects() {
  const response = await apiClient.get('/projects');
  return response.data;
}

export async function getProjectById(projectId) {
  const response = await apiClient.get(`/projects/${projectId}`);
  return response.data;
}

export async function updateProjectProgress(projectId, { actualProgress, status }) {
  const response = await apiClient.patch(`/projects/${projectId}/progress`, {
    actualProgress: Number(actualProgress),
    status: status
  });
  return response.data;
}
