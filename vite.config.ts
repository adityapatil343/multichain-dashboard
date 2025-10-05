import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When deploying to GitHub Pages, the app is served from a sub‑path
// (e.g. https://USERNAME.github.io/REPO). Without setting a base
// the built assets will be referenced from the root, which results in
// a blank page on GitHub Pages. We default the base to the repository
// name so it works out of the box when deployed via `npm run build && npm run deploy`.
// You can override this by exporting VITE_GH_PAGES_BASE in your environment.
const repoName = 'multichain-dashboard'
const base = process.env.VITE_GH_PAGES_BASE || `/${repoName}/`

export default defineConfig({
  plugins: [react()],
  base,
})
