import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },

    build: {
        chunkSizeWarningLimit: 2500,

        rolldownOptions: {
            output: {
                // Rolldown (Vite 8) native code splitting
                codeSplitting: {
                    strategy: 'auto',
                },
            },
        },

        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('recharts') || id.includes('d3-')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('jspdf')) {
                            return 'vendor-pdf';
                        }
                        if (id.includes('framer-motion')) {
                            return 'vendor-motion';
                        }
                        if (id.includes('sweetalert2')) {
                            return 'vendor-swal';
                        }
                        if (id.includes('html5-qrcode') || id.includes('qrcode')) {
                            return 'vendor-qr';
                        }
                    }
                },
            },
        },
    },

    server: {
        port: 5173,
        strictPort: false,
    },
});
