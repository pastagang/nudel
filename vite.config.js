import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        strudel: 'strudel.html', // iframe
        hydra: 'hydra.html', // iframe
        shader: 'shader.html', // iframe
      },
    },
  },
});
