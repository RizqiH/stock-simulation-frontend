interface PriceUpdate {
  symbol: string
  price: number
  change: number
  change_percent: number
  volume: number
  high: number
  low: number
  open: number
  previous_close: number
  last_trade_time: string
  market_cap?: number
}

interface WebSocketMessage {
  type: string
  data?: PriceUpdate
  message?: string
  client_id?: string
  timestamp: number
}

interface WebSocketOptions {
  reconnectAttempts?: number
  reconnectInterval?: number
  autoConnect?: boolean
}

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const { 
    reconnectAttempts = 5, 
    reconnectInterval = 3000,
    autoConnect = true 
  } = options

  const runtimeConfig = useRuntimeConfig()
  const { error: notifyError, success } = useNotifications()

  // State
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)
  const lastMessage = ref<WebSocketMessage | null>(null)
  const clientId = ref<string | null>(null)
  const reconnectCount = ref(0)

  // Price updates storage
  const priceUpdates = ref<Map<string, PriceUpdate>>(new Map())
  const updateCallbacks = ref<Map<string, Function[]>>(new Map())

  let ws: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  let heartbeatTimer: NodeJS.Timeout | null = null

  // WebSocket URL
  const getWebSocketUrl = () => {
    const apiUrl = runtimeConfig.public.apiBaseUrl as string
    if (!apiUrl) {
      throw new Error('API base URL not configured')
    }
    
    // Convert HTTP(S) URL to WebSocket URL
    const wsUrl = apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
    
    return `${wsUrl}/ws`
  }

  // Connect to WebSocket
  const connect = () => {
    if (isConnecting.value || isConnected.value) {
      return
    }

    try {
      isConnecting.value = true
      connectionError.value = null

      const wsUrl = getWebSocketUrl()
      console.log(`🔌 [WebSocket] Connecting to: ${wsUrl}`)

      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('✅ [WebSocket] Connected successfully')
        isConnected.value = true
        isConnecting.value = false
        reconnectCount.value = 0
        connectionError.value = null
        
        // Start heartbeat
        startHeartbeat()
        
        success('Real-time Updates', 'Connected to live price feeds')
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          lastMessage.value = message
          handleMessage(message)
        } catch (error) {
          console.error('❌ [WebSocket] Failed to parse message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ [WebSocket] Connection error:', error)
        connectionError.value = 'WebSocket connection error'
        isConnecting.value = false
      }

      ws.onclose = (event) => {
        console.log(`🔌 [WebSocket] Connection closed (code: ${event.code})`)
        isConnected.value = false
        isConnecting.value = false
        stopHeartbeat()
        
        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectCount.value < reconnectAttempts) {
          scheduleReconnect()
        } else if (reconnectCount.value >= reconnectAttempts) {
          connectionError.value = 'Max reconnection attempts reached'
          notifyError('Connection Lost', 'Failed to reconnect to real-time updates')
        }
      }

    } catch (error: any) {
      console.error('❌ [WebSocket] Connection failed:', error)
      isConnecting.value = false
      connectionError.value = error.message || 'Failed to connect'
    }
  }

  // Disconnect from WebSocket
  const disconnect = () => {
    if (ws) {
      ws.close(1000) // Normal closure
      ws = null
    }
    stopHeartbeat()
    stopReconnectTimer()
    isConnected.value = false
    isConnecting.value = false
  }

  // Handle incoming messages
  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'welcome':
        console.log('👋 [WebSocket] Welcome message:', message.message)
        clientId.value = message.client_id || null
        break

      case 'price_update':
        if (message.data) {
          handlePriceUpdate(message.data)
        }
        break

      case 'pong':
        console.log('🏓 [WebSocket] Pong received')
        break

      case 'heartbeat':
        console.log('💓 [WebSocket] Heartbeat received')
        break

      default:
        console.log('🔍 [WebSocket] Unknown message type:', message.type)
    }
  }

  // Handle price updates
  const handlePriceUpdate = (update: PriceUpdate) => {
    console.log(`📈 [WebSocket] Price update for ${update.symbol}: $${update.price} (${update.change_percent > 0 ? '+' : ''}${update.change_percent.toFixed(2)}%)`)
    
    // Store the update
    priceUpdates.value.set(update.symbol, update)
    
    // Trigger callbacks for this symbol
    const callbacks = updateCallbacks.value.get(update.symbol) || []
    callbacks.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error(`❌ [WebSocket] Callback error for ${update.symbol}:`, error)
      }
    })
    
    // Trigger global callbacks
    const globalCallbacks = updateCallbacks.value.get('*') || []
    globalCallbacks.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error(`❌ [WebSocket] Global callback error:`, error)
      }
    })
  }

  // Subscribe to price updates for specific symbol
  const subscribeToPriceUpdates = (symbol: string, callback: (update: PriceUpdate) => void) => {
    if (!updateCallbacks.value.has(symbol)) {
      updateCallbacks.value.set(symbol, [])
    }
    updateCallbacks.value.get(symbol)!.push(callback)
    
    console.log(`🔔 [WebSocket] Subscribed to ${symbol} price updates`)
    
    // Return unsubscribe function
    return () => {
      const callbacks = updateCallbacks.value.get(symbol)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
          console.log(`🔕 [WebSocket] Unsubscribed from ${symbol} price updates`)
        }
      }
    }
  }

  // Subscribe to all price updates
  const subscribeToAllPriceUpdates = (callback: (update: PriceUpdate) => void) => {
    return subscribeToPriceUpdates('*', callback)
  }

  // Get latest price for symbol
  const getLatestPrice = (symbol: string): PriceUpdate | null => {
    return priceUpdates.value.get(symbol) || null
  }

  // Get all latest prices
  const getAllLatestPrices = (): Record<string, PriceUpdate> => {
    const result: Record<string, PriceUpdate> = {}
    priceUpdates.value.forEach((update, symbol) => {
      result[symbol] = update
    })
    return result
  }

  // Schedule reconnection
  const scheduleReconnect = () => {
    if (reconnectCount.value >= reconnectAttempts) {
      return
    }

    reconnectCount.value++
    console.log(`🔄 [WebSocket] Scheduling reconnection attempt ${reconnectCount.value}/${reconnectAttempts} in ${reconnectInterval}ms`)

    reconnectTimer = setTimeout(() => {
      if (!isConnected.value && !isConnecting.value) {
        connect()
      }
    }, reconnectInterval)
  }

  // Stop reconnect timer
  const stopReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  // Start heartbeat
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // Send message
  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  // Lifecycle
  onMounted(() => {
    if (autoConnect) {
      connect()
    }
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    // State
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    connectionError: readonly(connectionError),
    lastMessage: readonly(lastMessage),
    clientId: readonly(clientId),
    reconnectCount: readonly(reconnectCount),

    // Methods
    connect,
    disconnect,
    sendMessage,
    subscribeToPriceUpdates,
    subscribeToAllPriceUpdates,
    getLatestPrice,
    getAllLatestPrices
  }
} 