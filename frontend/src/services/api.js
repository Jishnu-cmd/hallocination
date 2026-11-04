/**
 * API Service for Hallucination Detection Backend.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getDomains: () => client.get('/api/domains'),
  getModels: () => client.get('/api/models'),
  submitAnalysis: (payload) => client.post('/api/analysis', payload),
  getEvaluationMetrics: () => client.get('/api/evaluation/metrics'),
  runEigenScore: (text, context) => client.post('/api/detection/eigenscore', { text, context }),
  runConsistency: (text, context) => client.post('/api/detection/consistency', { text, context }),
  runEntropy: (text, context) => client.post('/api/detection/entropy', { text, context }),
  runRetrieval: (text, context) => client.post('/api/detection/retrieval', { text, context }),
};

export default apiService;

