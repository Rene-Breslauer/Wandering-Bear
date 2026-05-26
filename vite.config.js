import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    shopify({
      sourceCodeDir: 'frontend',
      entrypointsDir: 'frontend/entrypoints',
      snippetFile: 'vite-tag.liquid',
      versionNumbers: true
    }),
    tailwindcss()
  ],

  build: {
    // MUST stay false because Shopify plugin outputs into /assets
    emptyOutDir: false,

    rollupOptions: {
      output: {
        entryFileNames: 'wb-[name].[hash].js',
        chunkFileNames: 'wb-[name].[hash].js',
        assetFileNames: 'wb-[name].[hash][extname]'
      }
    }
  }
})