import { apiClient } from './client';

export async function getAlerts() {
  const response = await apiClient.get('/alerts');
  return response.data;
}

export async function getAlertById(alertId) {
  const response = await apiClient.get(`/alerts/${alertId}`);
  return response.data;
}

export async function createAlert(data) {
  const payload = {
    projectId: Number(data.projectId),
    alertType: data.alertType || 'OTHER',
    severity: data.severity || 'LOW',
    title: data.title,
    message: data.message,
    resolved: Boolean(data.resolved)
  };
  const response = await apiClient.post('/alerts', payload);
  return response.data;
}

export async function updateAlert(alertId, data) {
  const payload = {
    projectId: Number(data.projectId),
    alertType: data.alertType,
    severity: data.severity,
    title: data.title,
    message: data.message,
    resolved: Boolean(data.resolved)
  };
  const response = await apiClient.patch(`/alerts/${alertId}`, payload);
  return response.data;
}

export async function resolveAlert(alertId, existingAlert, isResolved) {
  const payload = {
    projectId: Number(existingAlert.project_id),
    alertType: existingAlert.alert_type,
    severity: existingAlert.severity,
    title: existingAlert.title,
    message: existingAlert.message,
    resolved: Boolean(isResolved)
  };
  const response = await apiClient.patch(`/alerts/${alertId}`, payload);
  return response.data;
}

export async function deleteAlert(alertId) {
  const response = await apiClient.delete(`/alerts/${alertId}`);
  return response.data;
}
