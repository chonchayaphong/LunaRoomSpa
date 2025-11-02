import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // ❌ เอา root ออก เพราะ index.html อยู่ในโฟลเดอร์หลัก
  root: '.',  // project root
  build: {
    outDir: 'public',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),      // <-- index.html อยู่ root
        massage: resolve(__dirname, 'src/pages/massage.html'),
        onsen: resolve(__dirname, 'src/pages/onsen.html'),
        products: resolve(__dirname, 'src/pages/products.html'),
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
