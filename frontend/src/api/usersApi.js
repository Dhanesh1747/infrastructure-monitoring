import { apiClient } from './client';

export async function getUsers() {
  const response = await apiClient.get('/users');
  return response.data;
}
