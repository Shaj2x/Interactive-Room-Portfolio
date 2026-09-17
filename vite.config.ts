import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is set for GitHub Pages project-site hosting
// (https://shaj2x.github.io/Interactive-Room-Portfolio/).
// Building with `BASE_PATH=/` deploys it at a domain root instead.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Interactive-Room-Portfolio/',
  plugins: [react()],
  build: { outDir: 'dist', assetsInlineLimit: 8192 },
});
