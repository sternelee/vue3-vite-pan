import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import alias from '@rollup/plugin-alias'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    alias({
      entries: [
        { find: /@\/(.*)/, replacement: '/src/$1'}
      ]
    }),
    vue()
  ],
  server: {
    proxy: {
      // 选项写法
      '/api': {
        target: 'http://localhost:5050/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
