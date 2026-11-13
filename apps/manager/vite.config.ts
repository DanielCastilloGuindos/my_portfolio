import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@portfolio/core': resolve(__dirname, '../../packages/core/src'),
      '@portfolio/db': resolve(__dirname, '../../packages/db/src'),
    },
  },
  server: {
    port: 5173,
  },
});
