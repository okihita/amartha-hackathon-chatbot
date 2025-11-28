import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  root: './frontend',
  plugins: [preact()],
  build: {
    outDir: '../public',
    emptyOutDir: false
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
