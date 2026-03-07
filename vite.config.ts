import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@theme/vite' // 如果你用緊 v4

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 🚀 加入呢一行，確保路徑正確對應你的 Repository 名稱
  base: '/beyblade-data/', 
})