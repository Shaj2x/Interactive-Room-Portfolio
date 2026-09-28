import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

// `base` is set for GitHub Pages project-site hosting
// (https://shaj2x.github.io/Interactive-Room-Portfolio/).
// Building with `BASE_PATH=/` deploys it at a domain root instead.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Interactive-Room-Portfolio/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 8192,
    // Two pages: the 2D room, and the react-three-fiber room. Three.js is only
    // downloaded by the second.
    rollupOptions: {
      input: { main: page('index.html'), room3d: page('room3d.html') },
    },
  },
});
