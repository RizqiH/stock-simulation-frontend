interface DebugConfig {
  enabled: boolean
  level: 'none' | 'error' | 'warn' | 'info' | 'debug' | 'all'
  modules: {
    api: boolean
    auth: boolean
    websocket: boolean
    charts: boolean
    portfolio: boolean
    orders: boolean
    notifications: boolean
    general: boolean
  }
}

// Check if we're in development (safe for both server and client)
const isDevelopment = () => {
  if (typeof window !== 'undefined') {
    // Client side - check hostname
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  } else {
    // Server side - check NODE_ENV
    return process.env.NODE_ENV === 'development'
  }
}

// Debug configuration - can be controlled via environment or localStorage
const defaultConfig: DebugConfig = {
  enabled: isDevelopment(),
  level: 'info', // Only show info level and above in production
  modules: {
    api: false,          // Reduce API debug noise
    auth: false,         // SECURITY: Keep auth debug disabled to prevent credential exposure
    websocket: false,    // Reduce WebSocket debug noise
    charts: false,       // Reduce charts debug noise
    portfolio: false,    // Reduce portfolio debug noise
    orders: false,       // Reduce orders debug noise
    notifications: false, // Reduce notifications debug noise
    general: true        // Keep general debug messages
  }
}

class DebugLogger {
  private config: DebugConfig

  constructor() {
    this.config = { ...defaultConfig }
    
    // Allow override from localStorage in browser
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('debug-config')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          this.config = { ...this.config, ...parsed }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
  }

  private shouldLog(module: keyof DebugConfig['modules'], level: string): boolean {
    if (!this.config.enabled) return false
    if (!this.config.modules[module]) return false
    
    const levels = ['none', 'error', 'warn', 'info', 'debug', 'all']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  // Utility method to filter sensitive data
  private filterSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data
    
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'auth']
    
    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item))
    }
    
    const filtered = { ...data }
    for (const key in filtered) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        filtered[key] = '***FILTERED***'
      } else if (typeof filtered[key] === 'object') {
        filtered[key] = this.filterSensitiveData(filtered[key])
      }
    }
    
    return filtered
  }

  // Main logging methods
  log(module: keyof DebugConfig['modules'], message: string, ...args: any[]) {
    if (this.shouldLog(module, 'info')) {
      const filteredArgs = args.map(arg => this.filterSensitiveData(arg))
      console.log(`[${module.toUpperCase()}] ${message}`, ...filteredArgs)
    }
  }

  info(module: keyof DebugConfig['modules'], message: string, ...args: any[]) {
    if (this.shouldLog(module, 'info')) {
      const filteredArgs = args.map(arg => this.filterSensitiveData(arg))
      console.info(`[${module.toUpperCase()}] ${message}`, ...filteredArgs)
    }
  }

  warn(module: keyof DebugConfig['modules'], message: string, ...args: any[]) {
    if (this.shouldLog(module, 'warn')) {
      const filteredArgs = args.map(arg => this.filterSensitiveData(arg))
      console.warn(`[${module.toUpperCase()}] ${message}`, ...filteredArgs)
    }
  }

  error(module: keyof DebugConfig['modules'], message: string, ...args: any[]) {
    if (this.shouldLog(module, 'error')) {
      const filteredArgs = args.map(arg => this.filterSensitiveData(arg))
      console.error(`[${module.toUpperCase()}] ${message}`, ...filteredArgs)
    }
  }

  debug(module: keyof DebugConfig['modules'], message: string, ...args: any[]) {
    if (this.shouldLog(module, 'debug')) {
      const filteredArgs = args.map(arg => this.filterSensitiveData(arg))
      console.debug(`[${module.toUpperCase()}] ${message}`, ...filteredArgs)
    }
  }

  // Configuration methods
  setConfig(newConfig: Partial<DebugConfig>) {
    this.config = { ...this.config, ...newConfig }
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-config', JSON.stringify(this.config))
    }
  }

  getConfig(): DebugConfig {
    return { ...this.config }
  }

  enableModule(module: keyof DebugConfig['modules']) {
    // Security warning for auth module
    if (module === 'auth') {
      console.warn('⚠️ [SECURITY WARNING] Enabling auth debug may expose sensitive credentials in console logs. Use with caution!')
    }
    
    this.config.modules[module] = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-config', JSON.stringify(this.config))
    }
  }

  disableModule(module: keyof DebugConfig['modules']) {
    this.config.modules[module] = false
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-config', JSON.stringify(this.config))
    }
  }

  // Utility methods for common patterns
  apiCall(endpoint: string, data?: any) {
    this.log('api', `Making API call to: ${endpoint}`, data)
  }

  apiResponse(endpoint: string, response: any) {
    this.log('api', `API response from ${endpoint}:`, response)
  }

  apiError(endpoint: string, error: any) {
    this.error('api', `API error for ${endpoint}:`, error)
  }

  wsConnect(url: string) {
    this.log('websocket', `Connecting to WebSocket: ${url}`)
  }

  wsMessage(type: string, data?: any) {
    this.log('websocket', `WebSocket message [${type}]:`, data)
  }

  authAction(action: string, data?: any) {
    this.log('auth', `Auth action: ${action}`, data)
  }

  chartAction(symbol: string, action: string, data?: any) {
    this.log('charts', `Chart [${symbol}] ${action}:`, data)
  }
}

// Export singleton instance
export const debugLogger = new DebugLogger()

// Export convenience methods
export const debug = {
  log: (module: keyof DebugConfig['modules'], message: string, ...args: any[]) => 
    debugLogger.log(module, message, ...args),
  info: (module: keyof DebugConfig['modules'], message: string, ...args: any[]) => 
    debugLogger.info(module, message, ...args),
  warn: (module: keyof DebugConfig['modules'], message: string, ...args: any[]) => 
    debugLogger.warn(module, message, ...args),
  error: (module: keyof DebugConfig['modules'], message: string, ...args: any[]) => 
    debugLogger.error(module, message, ...args),
  debug: (module: keyof DebugConfig['modules'], message: string, ...args: any[]) => 
    debugLogger.debug(module, message, ...args),
}

// Helper to enable debug mode from browser console
if (typeof window !== 'undefined') {
  (window as any).enableDebug = (modules?: string[]) => {
    console.log('🔧 Enabling debug mode...')
    
    if (modules) {
      modules.forEach(module => {
        if (module in debugLogger.getConfig().modules) {
          debugLogger.enableModule(module as keyof DebugConfig['modules'])
        }
      })
    } else {
      console.warn('⚠️ [SECURITY WARNING] Enabling all debug modules including auth may expose sensitive data!')
      debugLogger.setConfig({ enabled: true, level: 'all' })
      Object.keys(debugLogger.getConfig().modules).forEach(module => {
        debugLogger.enableModule(module as keyof DebugConfig['modules'])
      })
    }
    console.log('✅ Debug mode enabled. Available modules:', Object.keys(debugLogger.getConfig().modules))
  }

  (window as any).disableDebug = () => {
    debugLogger.setConfig({ enabled: false })
    console.log('Debug mode disabled')
  }

  (window as any).debugConfig = () => {
    console.log('Current debug configuration:', debugLogger.getConfig())
  }
} 