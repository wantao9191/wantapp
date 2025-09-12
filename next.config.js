/** @type {import('next').NextConfig} */
const nextConfig = {
  // 外部包配置
  serverExternalPackages: ['postgres'],
  
  // 跳过类型检查（生产构建时）
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // 实验性功能配置
  experimental: {
    // 确保 CSS 处理正常
    optimizePackageImports: ['antd'],
    // 开发环境优化配置
    ...(process.env.NODE_ENV === 'development' && {
      optimizeServerReact: false,
      webpackBuildWorker: false,
      serverComponentsHmrCache: false,
    }),
  },
  
  // 开发环境内存模式配置
  ...(process.env.NODE_ENV === 'development' && {
    distDir: '.next-memory',
    generateBuildId: async () => 'dev-' + Date.now(),
  }),
  
  // 优化打包
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 图片优化配置
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 输出配置 - 使用标准模式避免 Windows 权限问题
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // 完全禁用构建指示器
  devIndicators: {
  },
  
  // Webpack 配置
  webpack: (config, { isServer, dev }) => {
    // 基础配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // 开发环境内存模式优化
    if (dev && process.env.NODE_ENV === 'development') {
      config.cache = false
      config.watchOptions = {
        poll: 3000,
        aggregateTimeout: 1000,
        ignored: ['**/node_modules/**', '**/.next*/**', '**/.git/**'],
      }
      config.infrastructureLogging = { level: 'error' }
    }
    
    return config
  },
}

module.exports = nextConfig
