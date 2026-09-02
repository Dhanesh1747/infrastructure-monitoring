import { apiClient } from './client';

export async function getProjectUpdates() {
  const response = await apiClient.get('/project-updates');
  return response.data;
}

export async function getProjectUpdateById(updateId) {
  const response = await apiClient.get(`/project-updates/${updateId}`);
  return response.data;
}

export async function createProjectUpdate(data) {
  const payload = {
    projectId: Number(data.projectId),
    updateDate: data.updateDate, // 'YYYY-MM-DD'
    physicalProgress: Number(data.physicalProgress),
    expenditure: Number(data.expenditure),
    remarks: data.remarks || '',
    submittedBy: Number(data.submittedBy)
  };
  const response = await apiClient.post('/project-updates', payload);
  return response.data;
}

export async function updateProjectUpdate(updateId, data) {
  const payload = {
    projectId: Number(data.projectId),
    updateDate: data.updateDate,
    physicalProgress: Number(data.physicalProgress),
    expenditure: Number(data.expenditure),
    remarks: data.remarks || '',
    submittedBy: Number(data.submittedBy)
  };
  const response = await apiClient.patch(`/project-updates/${updateId}`, payload);
  return response.data;
}

export async function deleteProjectUpdate(updateId) {
  const response = await apiClient.delete(`/project-updates/${updateId}`);
  return response.data;
}
