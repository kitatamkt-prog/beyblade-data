import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // 👈 改做呢個，最無腦最穩陣
  plugins: [react(), tailwindcss()],
})