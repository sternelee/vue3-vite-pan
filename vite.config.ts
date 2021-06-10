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
  build: {
    base: './'
  }
})
