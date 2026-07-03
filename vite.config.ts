import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages 등 하위 경로 배포를 위해 상대 경로 사용
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
  },
  test: { environment: 'node', include: ['src/tests/**/*.test.ts'] },
} as never);
