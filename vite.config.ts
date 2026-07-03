import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
  },
  test: { environment: 'node', include: ['src/tests/**/*.test.ts'] },
} as never);
