// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Default base to your repo name; use VITE_GH_PAGES_BASE env override
const base = process.env.VITE_GH_PAGES_BASE || '/multichain-dashboard/'

export default defineConfig({
  plugins: [react()],
  base,
})
