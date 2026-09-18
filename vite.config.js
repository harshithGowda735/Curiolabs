import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  envPrefix: ['VITE_', 'FIREBASE_'],
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      three: path.resolve(__dirname, 'node_modules/three'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom', 'three'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'three'],
    exclude: ['@google/model-viewer'],
  },
})
