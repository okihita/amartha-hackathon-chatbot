import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: './frontend/index.html'
    }
  }
});
