import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { analyzer } from 'vite-bundle-analyzer';
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), tailwindcss(), analyzer({ analyzerMode: 'server' })],
});
