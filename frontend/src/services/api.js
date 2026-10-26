import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error || {
      message: error.message || 'An unexpected network error occurred.',
      code: 'NETWORK_ERROR'
    };
    return Promise.reject(errorData);
  }
);

export const eventService = {
  getEvents: (params) => apiClient.get('/events', { params }),
  getEventById: (id) => apiClient.get(`/events/${id}`),
  createEvent: (data) => apiClient.post('/events', data),
  updateEvent: (id, data) => apiClient.patch(`/events/${id}`, data),
  deleteEvent: (id) => apiClient.delete(`/events/${id}`),
  registerForEvent: (eventId, studentData) => 
    apiClient.post(`/events/${eventId}/registrations`, studentData),
  getEventRegistrations: (eventId) => 
    apiClient.get(`/events/${eventId}/registrations`)
};

export const clubService = {
  getClubs: () => apiClient.get('/clubs'),
  getClubById: (id) => apiClient.get(`/clubs/${id}`),
  createClub: (data) => apiClient.post('/clubs', data)
};

export const healthService = {
  checkHealth: () => apiClient.get('/health')
};

export default apiClient;
