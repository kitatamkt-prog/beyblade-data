import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/beyblade-data/', // 確保前後都有斜槓
  plugins: [react(), tailwindcss()],
})