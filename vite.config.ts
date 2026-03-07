import { defineConfig } from 'vite'
import react from '@vitejs/react-config'

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ 改做 './' 確保路徑係相對路徑，或者用 '/你的REPO名/'
})
