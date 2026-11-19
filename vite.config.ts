import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { mockBackend } from './mock-server/plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  // The mock backend answers on /api; see mock-server/plugin.ts
  plugins: [vue(), mockBackend()],
})
