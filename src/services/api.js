import axios from 'axios';

// Configure your Django backend URL here
const API_URL = 'http://localhost:8000/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadVideo = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) onProgress(percentCompleted);
    },
  });
  return response.data;
};

export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/`);
  return response.data;
};

export const triggerAI = async (projectId, actionType) => {
  // actionType: 'transcribe' | 'magic_cut'
  const response = await api.post(`/projects/${projectId}/ai/${actionType}/`);
  return response.data;
};

export default api;