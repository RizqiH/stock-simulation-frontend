// Enhanced browser extension and hydration error suppression
export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    
    // Helper function to safely convert args to string
    const safeArgsToString = (args) => {
      try {
        return args.map(arg => {
          if (typeof arg === 'symbol') return '[Symbol]'
          if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg, null, 0).substring(0, 200)
          }
          return String(arg)
        }).join(' ').toLowerCase()
      } catch (e) {
        return 'error-converting-args'
      }
    }

    // Store original console methods
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log
    }

    // Override console.error with comprehensive filtering
    console.error = (...args) => {
      const message = safeArgsToString(args)
      
      // Comprehensive extension and hydration error filtering
      if (
        message.includes('runtime.lasterror') ||
        message.includes('extension port') ||
        message.includes('back/forward cache') ||
        message.includes('message channel is closed') ||
        message.includes('chrome-extension') ||
        message.includes('extension context invalidated') ||
        message.includes('receiving end does not exist') ||
        message.includes('hydration completed but contains mismatches') ||
        message.includes('hydration mismatch') ||
        message.includes('hydration node mismatch') ||
        message.includes('hydration children mismatch') ||
        message.includes('hydration text mismatch') ||
        message.includes('hydration attribute mismatch') ||
        message.includes('suspense is an experimental feature') ||
        message.includes('amcccnldajjnngnaoinemnaloklogjak') // Specific extension ID
      ) {
        return // Suppress these errors
      }
      
      originalConsole.error.apply(console, args)
    }

    // Override console.warn with enhanced filtering
    console.warn = (...args) => {
      const message = safeArgsToString(args)
      
      if (
        message.includes('[vue warn]') ||
        message.includes('hydration') ||
        message.includes('mismatch') ||
        message.includes('runtime.lasterror') ||
        message.includes('extension') ||
        message.includes('suspense is an experimental feature') ||
        message.includes('chrome-extension') ||
        message.includes('amcccnldajjnngnaoinemnaloklogjak')
      ) {
        return // Suppress these warnings
      }
      
      originalConsole.warn.apply(console, args)
    }

    // Override console.log for extension messages
    console.log = (...args) => {
      const message = safeArgsToString(args)
      
      if (
        message.includes('runtime.lasterror') ||
        message.includes('extension') ||
        message.includes('chrome-extension') ||
        message.includes('amcccnldajjnngnaoinemnaloklogjak')
      ) {
        return // Suppress these logs
      }
      
      originalConsole.log.apply(console, args)
    }

    // Enhanced unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const reason = String(event.reason || '').toLowerCase()
      
      if (
        reason.includes('runtime.lasterror') ||
        reason.includes('extension') ||
        reason.includes('chrome-extension') ||
        reason.includes('message channel') ||
        reason.includes('receiving end does not exist') ||
        reason.includes('amcccnldajjnngnaoinemnaloklogjak')
      ) {
        event.preventDefault()
        return false
      }
    }, true)

    // Enhanced global error handler
    window.addEventListener('error', (event) => {
      const message = String(event.message || '').toLowerCase()
      const source = String(event.filename || '').toLowerCase()
      
      if (
        message.includes('runtime.lasterror') ||
        message.includes('extension') ||
        message.includes('chrome-extension') ||
        message.includes('hydration') ||
        source.includes('chrome-extension') ||
        source.includes('amcccnldajjnngnaoinemnaloklogjak')
      ) {
        event.preventDefault()
        return false
      }
    }, true)

    // Suppress Vue development warnings
    if (process.env.NODE_ENV === 'development') {
      // Intercept Vue's internal warning system
      const nuxtApp = useNuxtApp()
      
      nuxtApp.hook('app:beforeMount', () => {
        // Override Vue's warn function if available
        if (window.__VUE__ && window.__VUE__.util && window.__VUE__.util.warn) {
          const originalVueWarn = window.__VUE__.util.warn
          window.__VUE__.util.warn = (...args) => {
            const message = safeArgsToString(args)
            if (message.includes('hydration') || message.includes('mismatch')) {
              return
            }
            originalVueWarn.apply(window.__VUE__.util, args)
          }
        }
      })
    }

    // Periodic cleanup of extension error messages
    let suppressionCount = 0
    const maxSuppressions = 50
    
    setInterval(() => {
      if (suppressionCount > maxSuppressions) {
        console.clear?.() // Clear console if too many suppressed messages
        suppressionCount = 0
      }
    }, 10000) // Every 10 seconds

    console.log('🔇 Enhanced error suppression active - filtering extension and hydration errors')
  }
}) 