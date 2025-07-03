// Dedicated browser extension error suppressor
export default defineNuxtPlugin(() => {
  if (process.client) {
    
    // Specific extension IDs and patterns to suppress
    const EXTENSION_PATTERNS = [
      'amcccnldajjnngnaoinemnaloklogjak', // Specific extension causing issues
      'runtime.lasterror',
      'extension port',
      'back/forward cache',
      'message channel is closed',
      'chrome-extension://',
      'moz-extension://',
      'safari-web-extension://',
      'edge-extension://'
    ]

    // Intercept and suppress extension-related errors at the earliest stage
    const originalEventListeners = {
      addEventListener: EventTarget.prototype.addEventListener,
      removeEventListener: EventTarget.prototype.removeEventListener
    }

    // Override addEventListener to filter extension events
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'error' || type === 'unhandledrejection') {
        const wrappedListener = function(event) {
          const message = String(event.message || event.reason || '').toLowerCase()
          const source = String(event.filename || event.source || '').toLowerCase()
          
          // Check if this is an extension-related error
          const isExtensionError = EXTENSION_PATTERNS.some(pattern => 
            message.includes(pattern) || source.includes(pattern)
          )
          
          if (isExtensionError) {
            event.preventDefault?.()
            event.stopPropagation?.()
            event.stopImmediatePropagation?.()
            return false
          }
          
          // Call original listener for non-extension errors
          if (typeof listener === 'function') {
            return listener.call(this, event)
          }
        }
        
        return originalEventListeners.addEventListener.call(this, type, wrappedListener, options)
      }
      
      return originalEventListeners.addEventListener.call(this, type, listener, options)
    }

    // Aggressive console filtering specifically for extensions
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      info: console.info,
      debug: console.debug
    }

    // Helper to check if message is extension-related
    const isExtensionMessage = (args) => {
      try {
        const message = args.map(arg => String(arg || '')).join(' ').toLowerCase()
        return EXTENSION_PATTERNS.some(pattern => message.includes(pattern))
      } catch (e) {
        return false
      }
    }

    // Override all console methods
    console.error = (...args) => {
      if (!isExtensionMessage(args)) {
        originalConsole.error.apply(console, args)
      }
    }

    console.warn = (...args) => {
      if (!isExtensionMessage(args)) {
        originalConsole.warn.apply(console, args)
      }
    }

    console.log = (...args) => {
      if (!isExtensionMessage(args)) {
        originalConsole.log.apply(console, args)
      }
    }

    console.info = (...args) => {
      if (!isExtensionMessage(args)) {
        originalConsole.info.apply(console, args)
      }
    }

    console.debug = (...args) => {
      if (!isExtensionMessage(args)) {
        originalConsole.debug.apply(console, args)
      }
    }

    // Block extension requests at network level if possible
    if (window.fetch) {
      const originalFetch = window.fetch
      window.fetch = function(...args) {
        const url = String(args[0] || '')
        if (EXTENSION_PATTERNS.some(pattern => url.includes(pattern))) {
          return Promise.reject(new Error('Extension request blocked'))
        }
        return originalFetch.apply(this, args)
      }
    }

    // Monitor and clean DOM for extension-injected content
    const cleanExtensionContent = () => {
      try {
        // Remove extension-injected elements
        const extensionElements = document.querySelectorAll([
          '[src*="chrome-extension://"]',
          '[src*="moz-extension://"]',
          '[src*="amcccnldajjnngnaoinemnaloklogjak"]',
          '[data-extension]',
          '.extension-injected'
        ].join(','))
        
        extensionElements.forEach(el => {
          try {
            el.remove()
          } catch (e) {
            // Silently handle removal errors
          }
        })
      } catch (e) {
        // Silently handle cleanup errors
      }
    }

    // Run cleanup periodically
    setInterval(cleanExtensionContent, 5000)
    
    // Run cleanup on DOM changes
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => {
        cleanExtensionContent()
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }

    console.log('🔇 Extension suppressor loaded - blocking extension interference')
  }
}) 