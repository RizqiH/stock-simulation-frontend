// WebSocket Connection Tester for Real-Time Updates Diagnosis
import { debug } from './debug'

interface ConnectionTest {
  success: boolean
  error?: string
  latency?: number
  timestamp: string
}

interface WebSocketTestResult {
  apiHealth: ConnectionTest
  simulatorStatus: ConnectionTest
  websocketConnection: ConnectionTest
  priceUpdates: ConnectionTest
}

export class WebSocketTester {
  private runtimeConfig: any

  constructor() {
    if (typeof window !== 'undefined') {
      this.runtimeConfig = useRuntimeConfig()
    }
  }

  // Test API Health
  async testApiHealth(): Promise<ConnectionTest> {
    const timestamp = new Date().toISOString()
    try {
      const apiUrl = this.runtimeConfig?.public?.apiBaseUrl || 'https://go-backend-production-b653.up.railway.app/api/v1'
      const healthUrl = apiUrl.replace('/api/v1', '/health')
      
      const startTime = Date.now()
      const response = await fetch(healthUrl)
      const latency = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      debug.log('websocket', '✅ API Health Check Passed', { data, latency })
      
      return {
        success: true,
        latency,
        timestamp
      }
    } catch (error: any) {
      debug.error('websocket', '❌ API Health Check Failed', error)
      return {
        success: false,
        error: error.message,
        timestamp
      }
    }
  }

  // Test Simulator Status
  async testSimulatorStatus(): Promise<ConnectionTest> {
    const timestamp = new Date().toISOString()
    try {
      const apiUrl = this.runtimeConfig?.public?.apiBaseUrl || 'https://go-backend-production-b653.up.railway.app/api/v1'
      const simulatorUrl = `${apiUrl}/simulator/status`
      
      const startTime = Date.now()
      const response = await fetch(simulatorUrl)
      const latency = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      debug.log('websocket', '📊 Simulator Status Check', { data, latency })
      
      // Check if simulator is actually running
      if (!data.simulator?.running) {
        throw new Error('Price simulator is not running on backend')
      }
      
      return {
        success: true,
        latency,
        timestamp
      }
    } catch (error: any) {
      debug.error('websocket', '❌ Simulator Status Check Failed', error)
      return {
        success: false,
        error: error.message,
        timestamp
      }
    }
  }

  // Test WebSocket Connection
  async testWebSocketConnection(): Promise<ConnectionTest> {
    const timestamp = new Date().toISOString()
    
    return new Promise((resolve) => {
      try {
        const apiUrl = this.runtimeConfig?.public?.apiBaseUrl || 'https://go-backend-production-b653.up.railway.app/api/v1'
        const wsUrl = apiUrl
          .replace('http://', 'ws://')
          .replace('https://', 'wss://')
          .concat('/ws')
        
        debug.log('websocket', '🔌 Testing WebSocket connection to:', wsUrl)
        
        const startTime = Date.now()
        const ws = new WebSocket(wsUrl)
        
        let resolved = false
        
        ws.onopen = () => {
          const latency = Date.now() - startTime
          debug.log('websocket', '✅ WebSocket Connection Established', { latency })
          
          if (!resolved) {
            resolved = true
            ws.close()
            resolve({
              success: true,
              latency,
              timestamp
            })
          }
        }
        
        ws.onerror = (error) => {
          debug.error('websocket', '❌ WebSocket Connection Error', error)
          if (!resolved) {
            resolved = true
            resolve({
              success: false,
              error: 'WebSocket connection failed',
              timestamp
            })
          }
        }
        
        ws.onclose = (event) => {
          debug.log('websocket', '🔌 WebSocket Connection Closed', { code: event.code, reason: event.reason })
        }
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            ws.close()
            resolve({
              success: false,
              error: 'WebSocket connection timeout (10s)',
              timestamp
            })
          }
        }, 10000)
        
      } catch (error: any) {
        debug.error('websocket', '❌ WebSocket Test Error', error)
        resolve({
          success: false,
          error: error.message,
          timestamp
        })
      }
    })
  }

  // Test Price Updates Reception
  async testPriceUpdates(): Promise<ConnectionTest> {
    const timestamp = new Date().toISOString()
    
    return new Promise((resolve) => {
      try {
        const apiUrl = this.runtimeConfig?.public?.apiBaseUrl || 'https://go-backend-production-b653.up.railway.app/api/v1'
        const wsUrl = apiUrl
          .replace('http://', 'ws://')
          .replace('https://', 'wss://')
          .concat('/ws')
        
        debug.log('websocket', '📈 Testing Price Updates Reception...')
        
        const ws = new WebSocket(wsUrl)
        let resolved = false
        let messageReceived = false
        
        ws.onopen = () => {
          debug.log('websocket', '🔌 Connected, waiting for price updates...')
          
          // Set timeout for receiving price updates (30 seconds)
          setTimeout(() => {
            if (!resolved) {
              resolved = true
              ws.close()
              resolve({
                success: messageReceived,
                error: messageReceived ? undefined : 'No price updates received within 30 seconds',
                timestamp
              })
            }
          }, 30000)
        }
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            debug.log('websocket', '📨 WebSocket Message Received', message)
            
            if (message.type === 'price_update') {
              messageReceived = true
              debug.log('websocket', '✅ Price Update Received!', message.data)
              
              if (!resolved) {
                resolved = true
                ws.close()
                resolve({
                  success: true,
                  timestamp
                })
              }
            }
          } catch (error) {
            debug.error('websocket', '❌ Failed to parse WebSocket message', error)
          }
        }
        
        ws.onerror = (error) => {
          debug.error('websocket', '❌ WebSocket Error During Price Test', error)
          if (!resolved) {
            resolved = true
            resolve({
              success: false,
              error: 'WebSocket error during price update test',
              timestamp
            })
          }
        }
        
      } catch (error: any) {
        debug.error('websocket', '❌ Price Update Test Error', error)
        resolve({
          success: false,
          error: error.message,
          timestamp
        })
      }
    })
  }

  // Run Complete Test Suite
  async runCompleteTest(): Promise<WebSocketTestResult> {
    console.log('🧪 Starting Complete WebSocket Diagnostic Test...')
    
    const apiHealth = await this.testApiHealth()
    const simulatorStatus = await this.testSimulatorStatus()
    const websocketConnection = await this.testWebSocketConnection()
    
    let priceUpdates: ConnectionTest
    if (websocketConnection.success && simulatorStatus.success) {
      priceUpdates = await this.testPriceUpdates()
    } else {
      priceUpdates = {
        success: false,
        error: 'Skipped due to previous test failures',
        timestamp: new Date().toISOString()
      }
    }
    
    const result: WebSocketTestResult = {
      apiHealth,
      simulatorStatus,
      websocketConnection,
      priceUpdates
    }
    
    // Print summary
    console.log('📊 WebSocket Diagnostic Test Results:')
    console.log('├── API Health:', apiHealth.success ? '✅ PASS' : '❌ FAIL')
    console.log('├── Simulator Status:', simulatorStatus.success ? '✅ PASS' : '❌ FAIL')
    console.log('├── WebSocket Connection:', websocketConnection.success ? '✅ PASS' : '❌ FAIL')
    console.log('└── Price Updates:', priceUpdates.success ? '✅ PASS' : '❌ FAIL')
    
    if (!apiHealth.success) {
      console.error('❌ API Health Issue:', apiHealth.error)
    }
    if (!simulatorStatus.success) {
      console.error('❌ Simulator Issue:', simulatorStatus.error)
    }
    if (!websocketConnection.success) {
      console.error('❌ WebSocket Issue:', websocketConnection.error)
    }
    if (!priceUpdates.success) {
      console.error('❌ Price Updates Issue:', priceUpdates.error)
    }
    
    return result
  }
}

// Export singleton for global use
export const websocketTester = new WebSocketTester()

// Add to window for easy browser console access
if (typeof window !== 'undefined') {
  (window as any).testWebSocket = () => websocketTester.runCompleteTest()
  (window as any).testAPI = () => websocketTester.testApiHealth()
  (window as any).testSimulator = () => websocketTester.testSimulatorStatus()
  (window as any).testWSConnection = () => websocketTester.testWebSocketConnection()
  (window as any).testPriceUpdates = () => websocketTester.testPriceUpdates()
  
  console.log('🧪 WebSocket Testing Tools Available:')
  console.log('- testWebSocket() - Run complete diagnostic')
  console.log('- testAPI() - Test API health')
  console.log('- testSimulator() - Test price simulator')
  console.log('- testWSConnection() - Test WebSocket connection')
  console.log('- testPriceUpdates() - Test price update reception')
} 