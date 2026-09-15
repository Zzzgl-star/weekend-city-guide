import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 部署在 https://<user>.github.io/weekend-city-guide/ 子路径下
export default defineConfig({
  base: '/weekend-city-guide/',
  plugins: [react()],
})
