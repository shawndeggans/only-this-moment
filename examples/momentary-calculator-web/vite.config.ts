import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2022',
    minify: false, // Keep readable for demonstration purposes
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
})