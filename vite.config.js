import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import path from 'path'

export default defineConfig({
  plugins: [createVuePlugin()],
  base: process.env.GITHUB_ACTIONS ? '/executionplan.net/' : '/',
  resolve: {
    alias: {
      // vue-json-tree's main entry is a .vue source file Vite can't process from
      // node_modules, and its webpack dist has no proper ESM export; use a shim
      'vue-json-tree': path.resolve(__dirname, 'src/shims/vue-json-tree.js')
    }
  },
  optimizeDeps: {
    include: ['vue', 'showplan-js', 'showplan-vue']
  }
})
