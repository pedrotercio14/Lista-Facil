import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ListaFácil',
        short_name: 'ListaFácil',
        description: 'Seu app de lista de compras',
        theme_color: '#22c55e',
        background_color: '#f5f5f5',
        icons: []
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {}
    }
  }
})
