import axios from 'axios';

export const baseURL = 'https://api.niswa.online';

const api = axios.create({
    baseURL: `${baseURL}/api`,
});

// Ini akan otomatis menyelipkan token ke setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;