import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 確保係 @tailwindcss/vite 而唔係 @theme/vite

export default defineConfig({
  // 🚀 加入 base 確保 GitHub Pages 路徑正確
  base: '/beyblade-data/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
})