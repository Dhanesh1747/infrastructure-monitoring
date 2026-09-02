import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor for uniform error reporting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      if (error.response.status === 404) {
        friendlyMessage = error.response.data?.message || 'Requested resource not found.';
      } else if (error.response.status === 400) {
        friendlyMessage = error.response.data?.message || 'Invalid request parameters.';
      } else if (error.response.status >= 500) {
        friendlyMessage = 'Server error occurred. Please check system status.';
      } else if (error.response.data?.message) {
        friendlyMessage = error.response.data.message;
      }
    } else if (error.request) {
      friendlyMessage = 'Unable to connect to backend server at ' + baseURL + '. Please ensure the Spring Boot service is running.';
    }

    const enhancedError = new Error(friendlyMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    return Promise.reject(enhancedError);
  }
);
