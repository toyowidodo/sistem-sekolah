import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    // Menandai bahwa data user (role & permission) sudah selesai diambil dari server.
    // Guard rute wajib menunggu flag ini, kalau tidak user akan ditendang ke dashboard
    // setiap kali me-refresh halaman karena `user` masih null saat render pertama.
    userLoaded: false,

    login: async (credentials) => {
        const res = await api.post('/login', credentials);
        localStorage.setItem('token', res.data.token);
        set({ user: res.data.user, token: res.data.token, isAuthenticated: true, userLoaded: true });
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch {
            // Mengabaikan error logout jika token sudah tidak valid di server
        }
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, userLoaded: false });
    },

    fetchUser: async () => {
        try {
            const res = await api.get('/me');
            set({ user: res.data, userLoaded: true });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, userLoaded: true });
        }
    }
}));
