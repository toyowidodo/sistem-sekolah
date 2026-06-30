import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'dark',
            toggleTheme: () => {
                const next = get().theme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                set({ theme: next });
            },
            initTheme: () => {
                const saved = get().theme;
                document.documentElement.setAttribute('data-theme', saved);
            },
        }),
        { name: 'edu-theme' }
    )
);
