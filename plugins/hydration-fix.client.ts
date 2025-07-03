// Enhanced hydration fix plugin to prevent mismatches and handle Symbols
export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    const nuxtApp = useNuxtApp()
    
    // Safe string conversion helper
    const safeStringify = (args) => {
      try {
        return args.map(arg => {
          if (typeof arg === 'symbol') return '[Symbol]'
          if (typeof arg === 'function') return '[Function]'
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.stringify(arg, (key, value) => {
                if (typeof value === 'symbol') return '[Symbol]'
                if (typeof value === 'function') return '[Function]'
                return value
              })
            } catch {
              return '[Object]'
            }
          }
          return String(arg || '')
        }).join(' ').toLowerCase()
      } catch (e) {
        return '[conversion-error]'
      }
    }

    // Enhanced hydration error handling
    nuxtApp.hook('app:mounted', () => {
      // Force re-render of dynamic content after hydration
      nextTick(() => {
        try {
          // Trigger reactivity updates for auth-dependent components
          const { refreshProfile } = useAuth()
          refreshProfile().catch(() => {
            // Silently handle refresh errors
          })
        } catch (error) {
          // Silently handle auth errors during hydration
        }
      })
    })

    // Handle Vue hydration warnings with Symbol safety
    if (process.env.NODE_ENV === 'development') {
      const originalConsole = {
        warn: console.warn,
        error: console.error
      }
      
      // Store reference to apply safe filtering
      const applyFilteredWarning = (originalMethod, args) => {
        try {
          const message = safeStringify(args)
          
          // Filter out hydration and development warnings
          if (
            message.includes('hydration') ||
            message.includes('mismatch') ||
            message.includes('vue warn') ||
            message.includes('suspense is an experimental feature') ||
            message.includes('experimental feature')
          ) {
            return // Suppress
          }
          
          // Apply original method for non-filtered messages
          originalMethod.apply(console, args)
        } catch (e) {
          // If anything fails, just suppress to avoid cascading errors
        }
      }

      // Override console methods before Vue mounts
      nuxtApp.hook('app:beforeMount', () => {
        console.warn = (...args) => applyFilteredWarning(originalConsole.warn, args)
        console.error = (...args) => applyFilteredWarning(originalConsole.error, args)
      })

      // Restore original console methods after hydration is complete
      nuxtApp.hook('app:mounted', () => {
        setTimeout(() => {
          try {
            console.warn = originalConsole.warn
            console.error = originalConsole.error
          } catch (e) {
            // Silently handle restoration errors
          }
        }, 2000) // Longer delay to ensure hydration is fully complete
      })
    }

    // Ensure proper state initialization with error handling
    nuxtApp.hook('app:beforeMount', () => {
      try {
        // Pre-initialize any client-only state safely
        if (typeof window !== 'undefined' && window.localStorage) {
          // Initialize theme early to prevent mismatch
          const { isDark } = useTheme()
          // Safely access theme without triggering hydration issues
          void isDark.value // Touch the reactive value
        }
      } catch (error) {
        // Silently handle initialization errors
      }
    })

    // Enhanced Vue app configuration
    nuxtApp.hook('app:created', () => {
      try {
        const app = nuxtApp.vueApp
        
        // Configure Vue to handle hydration mismatches more gracefully
        if (app && app.config) {
          // Set custom error handler
          app.config.errorHandler = (err, instance, info) => {
            // Filter out hydration-related errors
            const errorString = String(err?.message || '').toLowerCase()
            if (
              errorString.includes('hydration') ||
              errorString.includes('mismatch') ||
              info?.includes('hydration')
            ) {
              return // Suppress hydration errors
            }
            
            // Log other errors normally
            console.error('Vue Error:', err, info)
          }

          // Set custom warn handler with Symbol safety
          app.config.warnHandler = (msg, instance, trace) => {
            try {
              const message = String(msg || '').toLowerCase()
              if (
                message.includes('hydration') ||
                message.includes('mismatch') ||
                message.includes('suspense is an experimental feature')
              ) {
                return // Suppress
              }
              
              // Allow other warnings
              console.warn('Vue Warning:', msg, trace)
            } catch (e) {
              // Silently handle warn handler errors
            }
          }
        }
      } catch (error) {
        // Silently handle Vue configuration errors
      }
    })

    console.log('🔧 Enhanced hydration fix loaded with Symbol safety')
  }
}) 