import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        landing: path.resolve(__dirname, 'landing.html'),
        politicasPrivacidad: path.resolve(__dirname, 'politicas-privacidad.html'),
        politicasSeguridad: path.resolve(__dirname, 'politicas-seguridad.html'),
      },
    },
  },
})
