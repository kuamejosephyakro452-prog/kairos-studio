import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_BASE_PATH || '/kairos-studio/';

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('react-dom') ||
                id.includes('react-router') ||
                id.includes('scheduler') ||
                /[\\/]node_modules[\\/]react[\\/]/.test(id)
              ) {
                return 'vendor';
              }
              if (id.includes('gsap') || id.includes('lenis')) {
                return 'motion';
              }
            }
          },
        },
      },
    },
  };
});
