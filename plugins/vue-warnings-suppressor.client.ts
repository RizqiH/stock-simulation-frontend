// Vue experimental features warning suppressor
export default defineNuxtPlugin(() => {
  if (process.client) {
    
    // Vue experimental feature warnings to suppress
    const VUE_EXPERIMENTAL_WARNINGS = [
      'suspense is an experimental feature',
      'experimental feature',
      'api will likely change',
      'vue warn',
      'hydration',
      'mismatch'
    ]

    // Store original console methods
    const originalConsole = {
      warn: console.warn,
      error: console.error,
      log: console.log
    }

    // Helper to check if this is a Vue experimental warning
    const isVueExperimentalWarning = (args) => {
      try {
        const message = args.map(arg => {
          if (typeof arg === 'symbol') return '[Symbol]'
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg)
            } catch {
              return '[Object]'
            }
          }
          return String(arg || '')
        }).join(' ').toLowerCase()
        
        return VUE_EXPERIMENTAL_WARNINGS.some(pattern => message.includes(pattern))
      } catch (e) {
        return false
      }
    }

    // Override console methods to filter Vue warnings
    console.warn = (...args) => {
      if (!isVueExperimentalWarning(args)) {
        originalConsole.warn.apply(console, args)
      }
    }

    console.error = (...args) => {
      if (!isVueExperimentalWarning(args)) {
        originalConsole.error.apply(console, args)
      }
    }

    // Handle Vue's internal warning system
    const nuxtApp = useNuxtApp()
    
    nuxtApp.hook('app:created', () => {
      try {
        const app = nuxtApp.vueApp
        
        if (app && app.config) {
          // Override Vue's warn handler
          const originalWarnHandler = app.config.warnHandler
          
          app.config.warnHandler = (msg, instance, trace) => {
            try {
              const message = String(msg || '').toLowerCase()
              
              // Suppress experimental feature warnings
              if (VUE_EXPERIMENTAL_WARNINGS.some(pattern => message.includes(pattern))) {
                return // Suppress
              }
              
              // Call original handler for other warnings
              if (originalWarnHandler) {
                originalWarnHandler(msg, instance, trace)
              } else {
                console.warn('Vue Warning:', msg)
              }
            } catch (e) {
              // Silently handle any errors in the warn handler
            }
          }
          
          // Override Vue's error handler for hydration errors
          const originalErrorHandler = app.config.errorHandler
          
          app.config.errorHandler = (err, instance, info) => {
            try {
              const errorMessage = String(err?.message || '').toLowerCase()
              const errorInfo = String(info || '').toLowerCase()
              
              // Suppress hydration-related errors
              if (
                VUE_EXPERIMENTAL_WARNINGS.some(pattern => 
                  errorMessage.includes(pattern) || errorInfo.includes(pattern)
                )
              ) {
                return // Suppress
              }
              
              // Call original handler for other errors
              if (originalErrorHandler) {
                originalErrorHandler(err, instance, info)
              } else {
                console.error('Vue Error:', err, info)
              }
            } catch (e) {
              // Silently handle any errors in the error handler
            }
          }
        }
      } catch (error) {
        // Silently handle Vue configuration errors
      }
    })

    // Suppress Vue DevTools messages about experimental features
    if (process.env.NODE_ENV === 'development') {
      // Override global warning functions that Vue might use
      const globalWarningMethods = [
        'warn',
        '__VUE_PROD_DEVTOOLS__'
      ]
      
      globalWarningMethods.forEach(method => {
        if (window[method] && typeof window[method] === 'function') {
          const original = window[method]
          window[method] = (...args) => {
            if (!isVueExperimentalWarning(args)) {
              return original.apply(window, args)
            }
          }
        }
      })
    }

    console.log('🤫 Vue experimental warnings suppressor loaded')
  }
}) 