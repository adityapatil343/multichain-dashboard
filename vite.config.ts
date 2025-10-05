
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If deploying to GitHub Pages at https://USERNAME.github.io/REPO,
// set base to '/REPO/'.
const base = process.env.VITE_GH_PAGES_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
