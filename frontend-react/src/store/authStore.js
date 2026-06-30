import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    
    login: async (credentials) => {
        const res = await api.post('/login', credentials);
        localStorage.setItem('token', res.data.token);
        set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
    },
    
    logout: async () => {
        try {
            await api.post('/logout');
        } catch {
            // Mengabaikan error logout jika token sudah tidak valid di server
        }
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
    
    fetchUser: async () => {
        try {
            const res = await api.get('/me');
            set({ user: res.data });
        } catch {
            localStorage.removeItem('token');
            set({ isAuthenticated: false });
        }
    }
}));