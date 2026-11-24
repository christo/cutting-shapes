import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { API_PREFIX, SERVER_HTTP_PORT } from './src/Api'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      [API_PREFIX]: `http://localhost:${SERVER_HTTP_PORT}`,
    },
  },
})
