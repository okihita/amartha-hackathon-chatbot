import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'public',
    emptyOutDir: false, // Don't delete existing files
    rollupOptions: {
      input: {
        main: './frontend/index.html'
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
      '/health': 'http://localhost:8080'
    }
  }
});
