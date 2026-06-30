import { create } from 'zustand';
import api from '../api/axios';

export const useSettingsStore = create((set) => ({
    appSettings: {
        school_name: 'EduAdmin',
        school_subtitle: 'School System',
        app_logo: null
    },
    fetchPublicSettings: async () => {
        try {
            const res = await api.get('/public-settings');
            if (res.data) {
                set({ 
                    appSettings: {
                        school_name: res.data.school_name || 'EduAdmin',
                        school_subtitle: res.data.school_subtitle || 'School System',
                        app_logo: res.data.app_logo || null
                    }
                });
            }
        } catch (err) {
            console.error('Failed to fetch public settings', err);
        }
    }
}));
