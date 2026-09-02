import { apiClient } from './client';

export async function getMilestones() {
  const response = await apiClient.get('/milestones');
  return response.data;
}

export async function getMilestoneById(milestoneId) {
  const response = await apiClient.get(`/milestones/${milestoneId}`);
  return response.data;
}

export async function createMilestone(data) {
  const payload = {
    projectId: Number(data.projectId),
    milestoneName: data.milestoneName,
    description: data.description || '',
    plannedDate: data.plannedDate, // 'YYYY-MM-DD'
    actualDate: data.actualDate || null,
    status: data.status || 'PENDING'
  };
  const response = await apiClient.post('/milestones', payload);
  return response.data;
}

export async function updateMilestone(milestoneId, data) {
  const payload = {
    projectId: data.projectId ? Number(data.projectId) : undefined,
    milestoneName: data.milestoneName,
    description: data.description || '',
    plannedDate: data.plannedDate,
    actualDate: data.actualDate || null,
    status: data.status
  };
  const response = await apiClient.patch(`/milestones/${milestoneId}`, payload);
  return response.data;
}

export async function deleteMilestone(milestoneId) {
  const response = await apiClient.delete(`/milestones/${milestoneId}`);
  return response.data;
}
