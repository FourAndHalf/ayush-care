import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves from /<repo>/, so CI sets VITE_BASE
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_API_TARGET || 'http://localhost:8080',
    },
  },
})
