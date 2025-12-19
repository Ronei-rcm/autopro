import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Permite acesso de qualquer IP
    proxy: {
      '/api': {
        // No Docker, o proxy do Vite roda no servidor e pode acessar 'backend'
        // Mas o navegador precisa usar localhost, então o proxy faz o redirecionamento
        target: process.env.DOCKER_ENV === 'true' ? 'http://backend:3001' : 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
          });
        },
      },
    },
  },
})

