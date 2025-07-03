// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  // ===== ESSENTIAL MODULES =====
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],

  // ===== CSS CONFIGURATION =====
  css: ['~/assets/css/main.css'],

  // ===== UI CONFIGURATION (v2) =====
  ui: {
    global: true
  },

  // ===== TAILWINDCSS CONFIGURATION =====
  tailwindcss: {
    configPath: '~/tailwind.config.ts'
  },

  // ===== FONT CONFIGURATION =====
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  },

  // ===== RUNTIME CONFIGURATION =====
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://go-backend-production-af7d.up.railway.app/api/v1'
    }
  },

  // ===== APP CONFIGURATION =====
  app: {
    head: {
      title: 'StockSim Pro - Virtual Trading Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Master stock trading without risk using our advanced virtual trading platform with real market data.' 
        },
        // Browser compatibility
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#4f46e5' },
        { name: 'msapplication-TileColor', content: '#4f46e5' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'StockSim Pro' },
        { property: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // ===== TYPESCRIPT CONFIGURATION =====
  typescript: {
    strict: false,
    typeCheck: false
  },

  // ===== SSR CONFIGURATION =====
  ssr: true,

  // ===== HYDRATION CONFIGURATION =====
  experimental: {
    payloadExtraction: false,
  },

  // ===== NITRO CONFIGURATION =====
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },

  // ===== VITE CONFIGURATION =====
  vite: {
    vue: {
      template: {
        transformAssetUrls: {
          includeAbsolute: false
        }
      }
    },
    define: {
      __DEV__: process.env.NODE_ENV === 'development'
    }
  },

  // ===== CLIENT-SIDE NAVIGATION =====
  router: {
    options: {
      hashMode: false
    }
  }
})