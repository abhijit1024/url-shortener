import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      rollupOptions: {
        external: ['@emotion/react/jsx-runtime']
      }
    },
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Add Emotion support
        jsxImportSource: '@emotion/react',
        babel: {
          presets: [
            ['@babel/preset-react', {
              runtime: 'automatic',
              importSource: '@emotion/react',
            }],
          ],
          plugins: [
            '@emotion/babel-plugin',
            ['@babel/plugin-transform-runtime', {
              regenerator: true,
            }],
          ],
        },
        jsxImportSource: '@emotion/react',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
    define: {
      'process.env': {}
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
