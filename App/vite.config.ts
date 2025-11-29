import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backlog-api-hqd4cvcmd7b6f8br.eastus2-01.azurewebsites.net',
        changeOrigin: true,
      },
    },
  },
})
