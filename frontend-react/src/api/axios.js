import axios from 'axios';
import logger from '../utils/logger.js';

export const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.niswa.online';
const timeout = import.meta.env.VITE_API_TIMEOUT || 30000;

const api = axios.create({
    baseURL: `${baseURL}/api`,
    timeout: parseInt(timeout),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
    }
);

// Response interceptor untuk menangani error dan token refresh
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired atau invalid
            logger.warn('Unauthorized access, redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            logger.warn('Access forbidden - insufficient permissions');
        } else if (error.response?.status === 422) {
            // Validation error
            logger.warn('Validation error', error.response?.data?.errors);
        } else if (error.response?.status === 429) {
            // Rate limited
            logger.error('Too many requests - rate limited', error.response?.data);
        } else if (error.response?.status >= 500) {
            logger.error('Server error', error.response?.data);
        } else if (error.message === 'Network Error' || !error.response) {
            logger.error('Network error - cannot reach server', {
                message: error.message,
                baseURL: baseURL,
            });
        }
        return Promise.reject(error);
    }
);

export default api;
