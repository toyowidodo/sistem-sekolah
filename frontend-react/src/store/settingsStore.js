import { create } from 'zustand';
import api from '../api/axios';

export const useSettingsStore = create((set) => ({
    appSettings: {
        school_name: 'EduAdmin',
        school_subtitle: 'School System',
        app_logo: null,
    },

    fetchPublicSettings: async () => {
        try {
            const res = await api.get('/public-settings');
            if (res.data) {
                set({
                    appSettings: {
                        school_name:     res.data.school_name     || 'EduAdmin',
                        school_subtitle: res.data.school_subtitle || 'School System',
                        app_logo:        res.data.app_logo        || null,
                    }
                });
            }
        } catch (err) {
            console.error('Failed to fetch public settings', err);
        }
    },

    /**
     * Update store secara langsung dari data yang sudah ada (tanpa refetch).
     * Dipanggil setelah admin menyimpan pengaturan.
     */
    updateSettings: (data) => {
        set((state) => ({
            appSettings: {
                ...state.appSettings,
                ...(data.school_name     !== undefined && { school_name:     data.school_name     || 'EduAdmin' }),
                ...(data.school_subtitle !== undefined && { school_subtitle: data.school_subtitle || 'School System' }),
                ...(data.app_logo        !== undefined && { app_logo:        data.app_logo        || null }),
            }
        }));
    },
}));
