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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Permite acesso de qualquer IP
    strictPort: false, // Não falhar se a porta estiver em uso
    allowedHosts: [
      'autopro.re9suainternet.com.br',
      'www.autopro.re9suainternet.com.br',
      'localhost',
      '127.0.0.1',
      '177.67.32.203',
    ],
    hmr: {
      // Configuração HMR para acesso externo
      clientPort: 5173,
      protocol: 'ws',
    },
    watch: {
      // Configuração de watch para volumes do Docker
      usePolling: process.env.DOCKER_ENV === 'true',
      interval: 1000,
    },
    proxy: {
      '/api': {
        // No Docker, o proxy do Vite roda no servidor e pode acessar 'backend'
        // Localmente, usa localhost:3002
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
    // Aumentar timeout para módulos grandes
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    // Incluir dependências pesadas no pré-bundle
    include: ['jspdf', 'html2canvas', 'recharts'],
    exclude: [],
  },
})

