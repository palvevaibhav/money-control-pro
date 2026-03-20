import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'motion'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ai: ['@google/genai', 'react-markdown'],
          capacitor: [
            '@capacitor/app',
            '@capacitor/browser',
            '@capacitor/camera',
            '@capacitor/core',
            '@capacitor/haptics',
            '@capacitor/keyboard',
            '@capacitor/status-bar',
            'capacitor-biometric-authentication',
          ],
          charts: ['recharts'],
          media: ['react-webcam', 'canvas-confetti'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
