import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relativ base så att appen kan hostas i en undermapp (t.ex. GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
})
