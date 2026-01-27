import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: '/',
  server: {
    port: 3000,
    open: false,
    hmr: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser'
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
});

