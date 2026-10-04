import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'icons/*.png'],
      manifest: {
        name: '喀小竞',
        short_name: '喀小竞',
        description: '大学生竞赛交流平台',
        lang: 'zh-CN',
        theme_color: '#1890ff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        // 必须保持 false（默认）——不要改成 true。
        // 后端的 CSRF 中间件用「Origin 的 host === 请求的 Host」判定同源；
        // 代理若改写 Host（changeOrigin: true），后端看到的 Host 变成 5000，
        // 与浏览器的 Origin(5173) 不一致 → 所有非 GET 请求被判为跨域而 403。
        // 而 CSRF 对跨域还要求 X-Requested-With 头（前端从不设置），
        // 所以改写 Host 会让本地开发的写操作（发帖/关注/点赞等）全部失败。
        changeOrigin: false,
      },
      '/uploads': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-charts': ['echarts'],
          'vendor-utils': ['axios', 'dayjs', 'lodash-es', 'zustand', 'socket.io-client'],
        },
      },
    },
  },
})
