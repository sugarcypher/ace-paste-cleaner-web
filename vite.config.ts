import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ace-paste-cleaner-web/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})




