import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const dev = process.env.NODE_ENV === "development"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: dev ? "/" : "/arknights-pulls-calculator",
})
