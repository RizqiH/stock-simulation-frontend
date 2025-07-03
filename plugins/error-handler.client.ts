// Handle browser extension errors that appear in console
export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    // Suppress browser extension errors
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      
      // Filter out browser extension errors
      if (
        message.includes('runtime.lastError') ||
        message.includes('extension port') ||
        message.includes('back/forward cache') ||
        message.includes('message channel is closed')
      ) {
        // Don't log these extension-related errors
        return
      }
      
      // Log other errors normally
      originalError.apply(console, args)
    }

    // Handle unhandled promise rejections from extensions
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason?.toString() || ''
      
      if (
        reason.includes('runtime.lastError') ||
        reason.includes('extension') ||
        reason.includes('chrome-extension')
      ) {
        // Prevent these from showing up as errors
        event.preventDefault()
      }
    })

    // Suppress hydration warnings in development
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn
      console.warn = (...args) => {
        const message = args[0]?.toString() || ''
        
        // Filter out hydration warnings
        if (
          message.includes('[Vue warn]') &&
          message.includes('Hydration')
        ) {
          // Don't log hydration warnings
          return
        }
        
        // Log other warnings normally
        originalWarn.apply(console, args)
      }
    }
  }
}) 