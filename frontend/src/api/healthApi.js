import { apiClient } from './client';

export async function checkBackendHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}
