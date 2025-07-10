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

  // ===== PLUGINS CONFIGURATION =====
  plugins: [
    // Error suppression plugins should load first and in specific order
    { src: '~/plugins/extension-suppressor.client.ts', mode: 'client' },
    { src: '~/plugins/error-handler.client.ts', mode: 'client' },
    { src: '~/plugins/vue-warnings-suppressor.client.ts', mode: 'client' },
    { src: '~/plugins/hydration-fix.client.ts', mode: 'client' },
    // WebSocket diagnostics for debugging real-time issues
    { src: '~/plugins/websocket-diagnostics.client.ts', mode: 'client' },
    // Other plugins load after error suppression
    { src: '~/plugins/auth.client.ts', mode: 'client' },
    { src: '~/plugins/apexcharts.client.ts', mode: 'client' }
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
      apiBaseUrl: process.env.API_BASE_URL || 'https://go-backend-production-b653.up.railway.app/api/v1'
    }
  },

  // ===== ROUTE RULES FOR HYDRATION =====
  routeRules: {
    // Disable SSR for pages with hydration issues during development
    ...(process.env.NODE_ENV === 'development' && {
      '/dashboard': { 
        ssr: true,
        prerender: false,
        // Add hydration mode for better debugging
        experimentalNoScripts: false
      }
    })
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
    // Reduce hydration mismatch issues
    viewTransition: false,
    // Better error handling
    asyncContext: false
  },

  // ===== VUE CONFIGURATION =====
  vue: {
    // Better hydration handling
    compilerOptions: {
      // Preserve whitespace to prevent hydration mismatches
      whitespace: 'preserve',
      // Disable production tips
      ...(process.env.NODE_ENV === 'development' && {
        comments: false
      })
    }
  },

  // ===== NITRO CONFIGURATION =====
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    // Better error handling in development
    ...(process.env.NODE_ENV === 'development' && {
      experimental: {
        wasm: false
      },
      // Reduce noise in development
      logLevel: 1
    })
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
      __DEV__: process.env.NODE_ENV === 'development',
      // Disable Vue dev warnings in production
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: false
    },
    // Better sourcemaps for debugging hydration issues
    ...(process.env.NODE_ENV === 'development' && {
      build: {
        sourcemap: true
      },
      // Reduce console noise
      logLevel: 'warn'
    })
  },

  // ===== CLIENT-SIDE NAVIGATION =====
  router: {
    options: {
      hashMode: false
    }
  },

  // ===== BUILD CONFIGURATION =====
  build: {
    // Reduce build noise
    analyze: false,
    ...(process.env.NODE_ENV === 'development' && {
      // Better debugging in development
      extractCSS: false
    })
  }
})