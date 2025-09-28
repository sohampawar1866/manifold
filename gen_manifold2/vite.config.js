import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'ethers', 'react-hot-toast', 'lucide-react'],
    exclude: []
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      BRIDGE_CONTRACT_20: JSON.stringify('0x...'), // Default contract addresses
      TOKEN_CONTRACT_20: JSON.stringify('0x...'),
      DEFI_CONTRACT_20: JSON.stringify('0x...'),
      ROUTER_CONTRACT_20: JSON.stringify('0x...')
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ethers-vendor': ['ethers']
        }
      }
    }
  }
})