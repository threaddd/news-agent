import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/news-agent/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild'
  },
  esbuild: {
    target: 'es2020'
  }
});
