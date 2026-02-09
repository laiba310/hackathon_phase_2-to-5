import axios from 'axios';

// Create an Axios instance pointing to the backend API
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://172.184.237.143:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the auth token
apiClient.interceptors.request.use(
  (request) => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Add the Authorization header with Bearer token
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error responses here if needed
    console.error('API Error:', error);

    // If we get a 401 error, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Force redirect to login
    }

    return Promise.reject(error);
  }
);

export default apiClient;