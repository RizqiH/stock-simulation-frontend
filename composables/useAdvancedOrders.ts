import { ref, computed, readonly } from 'vue'
import { useApi } from './useApi'
import { useNotifications } from './useNotifications'

// Types for advanced orders
export interface AdvancedOrder {
  id: number
  user_id: number
  stock_symbol: string
  order_type: OrderType
  side: OrderSide
  quantity: number
  price?: number
  stop_price?: number
  trailing_amount?: number
  trailing_percent?: number
  time_in_force: TimeInForce
  status: OrderStatus
  executed_price?: number
  executed_quantity: number
  remaining_quantity: number
  executed_at?: string
  expires_at?: string
  parent_order_id?: number
  linked_order_id?: number
  commission: number
  fees: number
  market_price: number
  bid_price?: number
  ask_price?: number
  spread?: number
  created_at: string
  updated_at: string
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP' | 'OCO'
export type OrderSide = 'BUY' | 'SELL' | 'SHORT' | 'COVER'
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'EXPIRED' | 'PARTIALLY_FILLED'
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'DAY'

export interface OrderRequest {
  stock_symbol: string
  order_type: OrderType
  side: OrderSide
  quantity: number
  price?: number
  stop_price?: number
  trailing_amount?: number
  trailing_percent?: number
  time_in_force: TimeInForce
  expires_at?: string
  linked_order?: OrderRequest
}

export interface OrderModification {
  price?: number
  stop_price?: number
  quantity?: number
  time_in_force?: TimeInForce
  expires_at?: string
  trailing_amount?: number
  trailing_percent?: number
}

export interface CommissionCalculation {
  base_commission: number
  regulatory_fees: number
  clearing_fees: number
  platform_fees: number
  total_commission: number
  effective_rate: number
  tier_applied?: any
}

export interface OrderStatistics {
  total_orders: number
  pending_orders: number
  executed_orders: number
  cancelled_orders: number
  partially_filled: number
  success_rate: number
  average_execution_time: number
  total_commission: number
  total_fees: number
}

export interface ExecutionMetrics {
  user_id: number
  timeframe: string
  total_orders: number
  executed_orders: number
  cancelled_orders: number
  partially_filled: number
  average_execution_time: number
  fill_rate: number
  average_slippage: number
  best_execution: number
  worst_execution: number
  total_commission: number
  total_fees: number
}

export interface SlippageAnalysis {
  symbol: string
  user_id: number
  total_trades: number
  average_slippage: number
  median_slippage: number
  slippage_std_dev: number
  best_execution: number
  worst_slippage: number
  market_order_slippage: number
  limit_order_slippage: number
}

export interface OrderSearchCriteria {
  symbol?: string
  order_type?: OrderType
  status?: OrderStatus
  side?: OrderSide
  start_date?: string
  end_date?: string
  min_price?: number
  max_price?: number
  min_quantity?: number
  max_quantity?: number
  limit?: number
  offset?: number
}

export const useAdvancedOrders = () => {
  const { apiCall } = useApi()
  const { success: showNotification, error: showError } = useNotifications()

  // State
  const orders = ref<AdvancedOrder[]>([])
  const activeOrders = ref<AdvancedOrder[]>([])
  const orderHistory = ref<AdvancedOrder[]>([])
  const orderStatistics = ref<OrderStatistics | null>(null)
  const executionMetrics = ref<ExecutionMetrics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const pendingOrders = computed(() => 
    activeOrders.value.filter(order => order.status === 'PENDING')
  )

  const partiallyFilledOrders = computed(() => 
    activeOrders.value.filter(order => order.status === 'PARTIALLY_FILLED')
  )

  const ordersBySymbol = computed(() => {
    const grouped: Record<string, AdvancedOrder[]> = {}
    orders.value.forEach(order => {
      if (!grouped[order.stock_symbol]) {
        grouped[order.stock_symbol] = []
      }
      grouped[order.stock_symbol].push(order)
    })
    return grouped
  })

  const totalCommissionPaid = computed(() => 
    orders.value.reduce((total, order) => total + order.commission + order.fees, 0)
  )

  // Helper function to get side label in Indonesian
  const getSideLabel = (side: OrderSide): string => {
    const labels: Record<OrderSide, string> = {
      'BUY': 'Beli',
      'SELL': 'Jual',
      'SHORT': 'Short',
      'COVER': 'Cover'
    }
    return labels[side] || side
  }

  // Order Creation Functions
  const createOrder = async (orderRequest: OrderRequest) => {
    try {
      loading.value = true
      error.value = null

      // For MARKET orders, use the same logic as Market page (direct transactions)
      if (orderRequest.order_type === 'MARKET') {
        return await executeMarketOrder(orderRequest)
      }

      // For other order types, use the orders API
      const response = await apiCall('/orders', 'POST', orderRequest)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Create specific notification with order details
      const sideLabel = getSideLabel(orderRequest.side)
      const orderTypeLabel = getOrderTypeLabel(orderRequest.order_type)
      const notificationTitle = `Order ${sideLabel} Berhasil Dibuat`
      const notificationMessage = `${orderTypeLabel} ${sideLabel} ${orderRequest.quantity} saham ${orderRequest.stock_symbol}`
      
      showNotification(notificationTitle, notificationMessage)
      await refreshActiveOrders()
      
      return response.data.order
    } catch (err: any) {
      error.value = err.message
      showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Execute Market Order using same logic as Market page
  const executeMarketOrder = async (orderRequest: OrderRequest) => {
    const { transactions } = useApi()
    
    const transactionData = {
      stock_symbol: orderRequest.stock_symbol,
      quantity: orderRequest.quantity
    }

    let result
    if (orderRequest.side === 'BUY') {
      result = await transactions.buy(transactionData)
    } else if (orderRequest.side === 'SELL') {
      result = await transactions.sell(transactionData)
    } else {
      throw new Error(`Market orders currently only support BUY and SELL sides. ${orderRequest.side} is not supported yet.`)
    }

    if (result.error) {
      throw new Error(result.error)
    }

    // Create notification with transaction details
    const sideLabel = getSideLabel(orderRequest.side)
    const actionText = orderRequest.side === 'BUY' ? 'Dibeli' : 'Dijual'
    const notificationTitle = `${actionText} ${orderRequest.quantity} saham ${orderRequest.stock_symbol}`
    const notificationMessage = `Transaksi berhasil dieksekusi`
    
    showNotification(notificationTitle, notificationMessage)
    
    // Return a consistent order-like object
    return {
      id: result.data?.transaction?.id || Date.now(),
      stock_symbol: orderRequest.stock_symbol,
      order_type: 'MARKET',
      side: orderRequest.side,
      quantity: orderRequest.quantity,
      status: 'EXECUTED',
      executed_price: result.data?.transaction?.price || 0,
      executed_quantity: orderRequest.quantity,
      transaction: result.data?.transaction
    }
  }

  const createMarketOrder = async (symbol: string, side: OrderSide, quantity: number) => {
    // Market orders use the transaction API directly (same as Market page)
    return createOrder({
      stock_symbol: symbol,
      order_type: 'MARKET',
      side,
      quantity,
      time_in_force: 'IOC'
    })
  }

  const createLimitOrder = async (
    symbol: string, 
    side: OrderSide, 
    quantity: number, 
    price: number,
    timeInForce: TimeInForce = 'GTC'
  ) => {
    return createOrder({
      stock_symbol: symbol,
      order_type: 'LIMIT',
      side,
      quantity,
      price,
      time_in_force: timeInForce
    })
  }

  const createStopLossOrder = async (
    symbol: string,
    side: OrderSide,
    quantity: number,
    stopPrice: number
  ) => {
    return createOrder({
      stock_symbol: symbol,
      order_type: 'STOP_LOSS',
      side,
      quantity,
      stop_price: stopPrice,
      time_in_force: 'GTC'
    })
  }

  const createTakeProfitOrder = async (
    symbol: string,
    side: OrderSide,
    quantity: number,
    stopPrice: number
  ) => {
    return createOrder({
      stock_symbol: symbol,
      order_type: 'TAKE_PROFIT',
      side,
      quantity,
      stop_price: stopPrice,
      time_in_force: 'GTC'
    })
  }

  const createTrailingStopOrder = async (
    symbol: string,
    side: OrderSide,
    quantity: number,
    trailingAmount?: number,
    trailingPercent?: number
  ) => {
    return createOrder({
      stock_symbol: symbol,
      order_type: 'TRAILING_STOP',
      side,
      quantity,
      trailing_amount: trailingAmount,
      trailing_percent: trailingPercent,
      time_in_force: 'GTC'
    })
  }

  const createOCOOrder = async (parentOrder: OrderRequest, linkedOrder: OrderRequest) => {
    try {
      loading.value = true
      error.value = null

      const response = await apiCall('/orders/oco', 'POST', {
        parent_order: parentOrder,
        linked_order: linkedOrder
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Create specific notification for OCO orders
      const parentSideLabel = getSideLabel(parentOrder.side)
      const linkedSideLabel = getSideLabel(linkedOrder.side)
      const notificationTitle = `OCO Order Berhasil Dibuat`
      const notificationMessage = `${parentSideLabel} ${parentOrder.quantity} & ${linkedSideLabel} ${linkedOrder.quantity} saham ${parentOrder.stock_symbol}`
      
      showNotification(notificationTitle, notificationMessage)
      await refreshActiveOrders()
      
      return {
        parentOrder: response.data.parent_order,
        linkedOrder: response.data.linked_order
      }
    } catch (err: any) {
      error.value = err.message
      showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Order Management Functions
  const modifyOrder = async (orderId: number, modifications: OrderModification) => {
    try {
      loading.value = true

      const response = await apiCall(`/orders/${orderId}`, 'PUT', modifications)
      
      if (response.error) {
        throw new Error(response.error)
      }

      showNotification('Order Berhasil Dimodifikasi', 'Perubahan order telah disimpan')
      await refreshActiveOrders()
      
      return response.data.order
    } catch (err: any) {
      error.value = err.message
      showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (orderId: number) => {
    try {
      loading.value = true

      const response = await apiCall(`/orders/${orderId}`, 'DELETE')
      
      if (response.error) {
        throw new Error(response.error)
      }

      showNotification('Order Berhasil Dibatalkan', 'Order telah dihapus dari sistem')
      await refreshActiveOrders()
      
      return true
    } catch (err: any) {
      error.value = err.message
      showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelAllOrders = async (symbol?: string) => {
    try {
      loading.value = true

      const params = symbol ? `?symbol=${symbol}` : ''
      const response = await apiCall(`/orders/cancel-all${params}`, 'POST')
      
      if (response.error) {
        throw new Error(response.error)
      }

      const cancelledCount = response.data.cancelled_count
      showNotification(`${cancelledCount} Order Dibatalkan`, `Semua order telah dihapus dari sistem`)
      await refreshActiveOrders()
      
      return cancelledCount
    } catch (err: any) {
      error.value = err.message
      showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Data Fetching Functions
  const fetchOrders = async (criteria?: OrderSearchCriteria) => {
    try {
      loading.value = true
      error.value = null

      const params = new URLSearchParams()
      if (criteria) {
        Object.entries(criteria).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
      }

      const response = await apiCall(`/orders?${params.toString()}`, 'GET')
      
      if (response.error) {
        throw new Error(response.error)
      }

      orders.value = response.data.orders
      return response.data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshActiveOrders = async () => {
    try {
      const response = await apiCall('/orders/active', 'GET')
      
      if (response.error) {
        throw new Error(response.error)
      }

      activeOrders.value = response.data.orders
    } catch (err: any) {
      error.value = err.message
    }
  }

  const fetchOrderById = async (orderId: number) => {
    try {
      const response = await apiCall(`/orders/${orderId}`, 'GET')
      
      if (response.error) {
        throw new Error(response.error)
      }

      return response.data.order
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const fetchOrderStatistics = async () => {
    try {
      const response = await apiCall('/orders/statistics', 'GET')
      
      if (response.error) {
        console.warn('Order statistics error:', response.error)
        // Set default statistics instead of throwing error
        orderStatistics.value = {
          total_orders: 0,
          pending_orders: 0,
          executed_orders: 0,
          cancelled_orders: 0,
          partially_filled: 0,
          success_rate: 0,
          average_execution_time: 0,
          total_commission: 0,
          total_fees: 0
        }
        return orderStatistics.value
      }

      orderStatistics.value = response.data.statistics
      return response.data.statistics
    } catch (err: any) {
      console.warn('Failed to fetch order statistics:', err.message)
      // Set default statistics instead of throwing error
      orderStatistics.value = {
        total_orders: 0,
        pending_orders: 0,
        executed_orders: 0,
        cancelled_orders: 0,
        partially_filled: 0,
        success_rate: 0,
        average_execution_time: 0,
        total_commission: 0,
        total_fees: 0
      }
      return orderStatistics.value
    }
  }

  const fetchExecutionMetrics = async (timeframe: string = 'month') => {
    try {
      const response = await apiCall(`/orders/execution-metrics?timeframe=${timeframe}`, 'GET')
      
      if (response.error) {
        throw new Error(response.error)
      }

      executionMetrics.value = response.data.metrics
      return response.data.metrics
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const fetchSlippageAnalysis = async (symbol: string) => {
    try {
      const response = await apiCall(`/orders/slippage/${symbol}`, 'GET')
      
      if (response.error) {
        throw new Error(response.error)
      }

      return response.data.analysis
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Commission Functions
  const calculateCommissionEstimate = async (
    tradeValue: number,
    orderType: OrderType,
    assetType: string = 'stock'
  ): Promise<CommissionCalculation> => {
    // Always use fallback calculation for now since backend endpoint might not be ready
    console.log('Using local commission calculation for:', { tradeValue, orderType, assetType })
    
    // Simple commission structure
    let baseCommission = 6.95
    const regulatoryFees = 0.50
    const clearingFees = 0.25
    let platformFees = 1.00
    
    // Adjust based on trade value
    if (tradeValue > 10000) {
      baseCommission = 4.95
      platformFees = 0.75
    } else if (tradeValue > 5000) {
      baseCommission = 5.95
      platformFees = 0.90
    }
    
    // Market orders get slightly higher commission
    if (orderType === 'MARKET') {
      baseCommission += 0.50
    }
    
    const totalCommission = baseCommission + regulatoryFees + clearingFees + platformFees
    const effectiveRate = totalCommission / tradeValue
    
    return {
      base_commission: baseCommission,
      regulatory_fees: regulatoryFees,
      clearing_fees: clearingFees,
      platform_fees: platformFees,
      total_commission: totalCommission,
      effective_rate: effectiveRate
    }
  }

  // Real-time subscriptions (simplified for now)
  const setupOrderUpdates = () => {
    // TODO: Implement WebSocket connection for real-time order updates
    console.log('Order updates subscription set up')
  }

  const setupTradeExecutions = () => {
    // TODO: Implement WebSocket connection for real-time trade executions
    console.log('Trade execution subscription set up')
  }

  // Utility Functions
  const getOrderTypeLabel = (orderType: OrderType) => {
    const labels: Record<OrderType, string> = {
      'MARKET': 'Market',
      'LIMIT': 'Limit',
      'STOP_LOSS': 'Stop Loss',
      'TAKE_PROFIT': 'Take Profit',
      'TRAILING_STOP': 'Trailing Stop',
      'OCO': 'OCO'
    }
    return labels[orderType] || orderType
  }

  const getOrderStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      'PENDING': 'blue',
      'EXECUTED': 'green',
      'CANCELLED': 'red',
      'EXPIRED': 'gray',
      'PARTIALLY_FILLED': 'orange'
    }
    return colors[status] || 'gray'
  }

  const formatTimeInForce = (tif: TimeInForce) => {
    const labels: Record<TimeInForce, string> = {
      'GTC': 'Good Till Cancelled',
      'IOC': 'Immediate or Cancel',
      'FOK': 'Fill or Kill',
      'DAY': 'Day Order'
    }
    return labels[tif] || tif
  }

  // Initialize
  const init = () => {
    refreshActiveOrders()
    fetchOrderStatistics()
    setupOrderUpdates()
    setupTradeExecutions()
  }

  return {
    // State
    orders: readonly(orders),
    activeOrders: readonly(activeOrders),
    orderHistory: readonly(orderHistory),
    orderStatistics: readonly(orderStatistics),
    executionMetrics: readonly(executionMetrics),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    pendingOrders,
    partiallyFilledOrders,
    ordersBySymbol,
    totalCommissionPaid,

    // Order Creation
    createOrder,
    createMarketOrder,
    createLimitOrder,
    createStopLossOrder,
    createTakeProfitOrder,
    createTrailingStopOrder,
    createOCOOrder,

    // Order Management
    modifyOrder,
    cancelOrder,
    cancelAllOrders,

    // Data Fetching
    fetchOrders,
    refreshActiveOrders,
    fetchOrderById,
    fetchOrderStatistics,
    fetchExecutionMetrics,
    fetchSlippageAnalysis,

    // Commission
    calculateCommissionEstimate,

    // Utilities
    getOrderTypeLabel,
    getOrderStatusColor,
    formatTimeInForce,
    getSideLabel,

    // Initialize
    init
  }
} 