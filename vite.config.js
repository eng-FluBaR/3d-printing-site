import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  server: {
    port: 3000,
    open: false,
    hmr: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './src/pages/index/index.html',
        calculator: './src/pages/calculator/calculator.html',
        services: './src/pages/services/services.html',
        gallery: './src/pages/gallery/gallery.html',
        about: './src/pages/about/about.html',
        contact: './src/pages/contact/contact.html'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        includePaths: ['./node_modules']
      }
    }
  }
});


