import { create } from 'zustand';
import api from '../api/axios';

const STORAGE_KEY = 'parent_selected_child';

/**
 * Menyimpan anak yang sedang dilihat orang tua. Dipisah ke store supaya
 * pilihannya bertahan saat berpindah halaman portal, bukan ter-reset tiap
 * komponen dipasang ulang.
 */
export const useChildStore = create((set, get) => ({
    children: [],
    selectedId: localStorage.getItem(STORAGE_KEY) || '',
    loaded: false,

    fetchChildren: async () => {
        if (get().loaded) return;
        try {
            const res = await api.get('/parent/children');
            const list = res.data.data || [];

            // Pilihan tersimpan bisa jadi sudah tidak berlaku (anak lulus, akses dicabut)
            const stored = localStorage.getItem(STORAGE_KEY);
            const valid = list.some(c => String(c.id) === String(stored));
            const selectedId = valid ? String(stored) : String(list[0]?.id || '');

            if (selectedId) localStorage.setItem(STORAGE_KEY, selectedId);
            set({ children: list, selectedId, loaded: true });
        } catch {
            set({ children: [], loaded: true });
        }
    },

    selectChild: (id) => {
        localStorage.setItem(STORAGE_KEY, String(id));
        set({ selectedId: String(id) });
    },
}));
