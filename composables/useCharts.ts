interface HistoricalPrice {
  id: number
  symbol: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  created_at: string
}

interface ChartIndicators {
  ma20: number[]
  ma50: number[]
  rsi: number[]
  volume: number[]
}

interface ChartData {
  symbol: string
  period: string
  prices: HistoricalPrice[]
  indicators: ChartIndicators
}

interface ChartOptions {
  period?: string
  indicators?: boolean
  theme?: 'light' | 'dark'
  realTime?: boolean
}

interface RealTimeChartData {
  symbol: string
  data: any[]
  lastUpdate: Date
  updateCount: number
}

export const useCharts = () => {
  const { charts } = useApi()
  const { subscribeToPriceUpdates, getLatestPrice } = useWebSocket()
  
  // Real-time chart data storage
  const realTimeCharts = ref<Map<string, RealTimeChartData>>(new Map())
  const chartUpdateCallbacks = ref<Map<string, Function[]>>(new Map())
  
  // Get chart data for a symbol
  const getChartData = async (symbol: string, options: ChartOptions = {}) => {
    const { period = '30D', indicators = true } = options
    
    try {
      console.log(`🔍 [useCharts] Loading chart data for ${symbol}, period: ${period}`)
      console.log(`🔍 [useCharts] API Base URL: ${useRuntimeConfig().public.apiBaseUrl}`)
      
      const result = await charts.getChartData(symbol, period)
      
      console.log(`🔍 [useCharts] Raw API result:`, result)
      
      // Handle potential double wrapping from Axios + Backend response
      let actualData = null
      
      if (result.data) {
        console.log('✅ [useCharts] Chart data loaded successfully:', result.data)
        console.log('✅ [useCharts] Data type:', typeof result.data)
        console.log('✅ [useCharts] Data keys:', Object.keys(result.data))
        
        // Check if data has nested data property (double wrapping)
        if (result.data.data && result.data.data.prices) {
          console.log('🔍 [useCharts] Double wrapping detected - using nested data')
          actualData = result.data.data
        } else if (result.data.prices) {
          console.log('🔍 [useCharts] Direct data structure - using direct data')
          actualData = result.data
        } else {
          console.log('❌ [useCharts] Unknown data structure:', result.data)
          return {
            data: null,
            error: 'Invalid data structure received from API'
          }
        }
        
        console.log('✅ [useCharts] Final data symbol:', actualData.symbol)
        console.log('✅ [useCharts] Final data prices:', actualData.prices?.length, 'records')
        console.log('✅ [useCharts] Final data indicators:', actualData.indicators ? 'present' : 'missing')
        
        return {
          data: actualData as ChartData,
          error: null
        }
      } else {
        console.error('❌ [useCharts] Chart data error:', result.error)
        return {
          data: null,
          error: result.error || 'Failed to fetch chart data'
        }
      }
    } catch (error: any) {
      console.error('❌ [useCharts] Chart fetch error:', error)
      console.error('❌ [useCharts] Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        data: error.data
      })
      return {
        data: null,
        error: error.message || 'Failed to fetch chart data'
      }
    }
  }

  // Get historical prices only
  const getHistoricalPrices = async (symbol: string, limit: number = 30) => {
    try {
      const response = await charts.getHistoricalPrices(symbol, limit)
      return {
        data: response.data as { symbol: string; prices: HistoricalPrice[] },
        error: response.error || null
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch historical prices'
      }
    }
  }

  // Get available symbols
  const getAvailableSymbols = async () => {
    try {
      const response = await charts.getAvailableSymbols()
      return {
        data: response.data as { symbols: string[] },
        error: response.error || null
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch symbols'
      }
    }
  }

  // Subscribe to real-time chart updates
  const subscribeToRealTimeChart = (symbol: string, callback: (update: any) => void) => {
    console.log(`📊 [useCharts] Subscribing to real-time updates for ${symbol}`)
    
    // Initialize chart data if not exists
    if (!realTimeCharts.value.has(symbol)) {
      realTimeCharts.value.set(symbol, {
        symbol,
        data: [],
        lastUpdate: new Date(),
        updateCount: 0
      })
    }
    
    // Store callback
    if (!chartUpdateCallbacks.value.has(symbol)) {
      chartUpdateCallbacks.value.set(symbol, [])
    }
    chartUpdateCallbacks.value.get(symbol)!.push(callback)
    
    // Subscribe to WebSocket price updates
    const unsubscribe = subscribeToPriceUpdates(symbol, (priceUpdate) => {
      updateRealTimeChart(symbol, priceUpdate)
    })
    
    // Return unsubscribe function
    return () => {
      unsubscribe()
      const callbacks = chartUpdateCallbacks.value.get(symbol)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Update real-time chart with new price data
  const updateRealTimeChart = (symbol: string, priceUpdate: any) => {
    const chartData = realTimeCharts.value.get(symbol)
    if (!chartData) return
    
    const now = new Date()
    const newDataPoint = {
      x: now.getTime(),
      y: priceUpdate.price,
      open: priceUpdate.open,
      high: priceUpdate.high,
      low: priceUpdate.low,
      close: priceUpdate.price,
      volume: priceUpdate.volume
    }
    
    // Add new data point
    chartData.data.push(newDataPoint)
    chartData.lastUpdate = now
    chartData.updateCount++
    
    // Keep only last 100 data points for performance
    if (chartData.data.length > 100) {
      chartData.data = chartData.data.slice(-100)
    }
    
    console.log(`📊 [useCharts] Updated real-time chart for ${symbol}: $${priceUpdate.price}`)
    
    // Trigger callbacks
    const callbacks = chartUpdateCallbacks.value.get(symbol) || []
    callbacks.forEach(callback => {
      try {
        callback({
          symbol,
          dataPoint: newDataPoint,
          allData: [...chartData.data],
          updateCount: chartData.updateCount
        })
      } catch (error) {
        console.error(`❌ [useCharts] Chart callback error for ${symbol}:`, error)
      }
    })
  }

  // Get real-time chart data
  const getRealTimeChartData = (symbol: string) => {
    return realTimeCharts.value.get(symbol) || null
  }

  // Generate candlestick chart options
  const generateCandlestickOptions = (
    symbol: string, 
    prices: HistoricalPrice[], 
    indicators?: ChartIndicators,
    theme: 'light' | 'dark' = 'light',
    realTimeMode: boolean = false
  ) => {
    const isDark = theme === 'dark'
    
    // Validate input data
    if (!Array.isArray(prices) || prices.length === 0) {
      console.log(`❌ [generateCandlestickOptions] Invalid prices data for ${symbol}`)
      return {
        series: [],
        chart: { type: 'candlestick', height: 400 },
        title: { text: `${symbol} - No Data Available` }
      }
    }
    
    // Prepare candlestick data with validation
    const candlestickData = prices.filter(price => 
      price && price.date && typeof price.open === 'number' && 
      typeof price.high === 'number' && typeof price.low === 'number' && 
      typeof price.close === 'number'
    ).map(price => ({
      x: new Date(price.date).getTime(),
      y: [price.open, price.high, price.low, price.close]
    }))

    // Prepare volume data with validation
    const volumeData = prices.filter(price => 
      price && price.date && typeof price.volume === 'number'
    ).map(price => ({
      x: new Date(price.date).getTime(),
      y: price.volume || 0
    }))

    const series: any[] = [
      {
        name: 'Price',
        type: 'candlestick',
        data: candlestickData
      },
      {
        name: 'Volume',
        type: 'column',
        data: volumeData,
        yAxisIndex: 1
      }
    ]

    // Add moving averages if available
    if (indicators?.ma20 && Array.isArray(indicators.ma20) && indicators.ma20.length > 0) {
      const ma20Data = prices.map((price, index) => ({
        x: new Date(price.date).getTime(),
        y: indicators.ma20[index] || null
      })).filter(item => item.y !== null && typeof item.y === 'number')

      if (ma20Data.length > 0) {
        series.push({
          name: 'MA20',
          type: 'line',
          data: ma20Data,
          color: '#f59e0b'
        })
      }
    }

    if (indicators?.ma50 && Array.isArray(indicators.ma50) && indicators.ma50.length > 0) {
      const ma50Data = prices.map((price, index) => ({
        x: new Date(price.date).getTime(),
        y: indicators.ma50[index] || null
      })).filter(item => item.y !== null && typeof item.y === 'number')

      if (ma50Data.length > 0) {
        series.push({
          name: 'MA50',
          type: 'line',
          data: ma50Data,
          color: '#8b5cf6'
        })
      }
    }

    const chartOptions = {
      series,
      chart: {
        type: 'candlestick',
        height: 400,
        background: 'transparent',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: !realTimeMode, // Disable animations for real-time mode
          easing: 'easeinout',
          speed: realTimeMode ? 100 : 800
        }
      },
      title: {
        text: `${symbol} Stock Price${realTimeMode ? ' (Live)' : ''}`,
        align: 'left',
        style: {
          color: isDark ? '#ffffff' : '#374151'
        }
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#10b981',
            downward: '#ef4444'
          },
          wick: {
            useFillColor: true
          }
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280'
          }
        },
        axisBorder: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      yaxis: [
        {
          tooltip: {
            enabled: true
          },
          labels: {
            style: {
              colors: isDark ? '#9ca3af' : '#6b7280'
            },
            formatter: (value: number) => `$${value.toFixed(2)}`
          }
        },
        {
          opposite: true,
          tooltip: {
            enabled: true
          },
          labels: {
            style: {
              colors: isDark ? '#9ca3af' : '#6b7280'
            },
            formatter: (value: number) => {
              if (!value && value !== 0) return '0'
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`
              }
              return value.toString()
            }
          }
        }
      ],
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb'
      },
      legend: {
        show: true,
        labels: {
          colors: isDark ? '#9ca3af' : '#6b7280'
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light'
      }
    }

    // Add real-time indicator
    if (realTimeMode) {
      chartOptions.title.text += ' 🔴'
    }

    return chartOptions
  }

  // Generate line chart options (simpler view)
  const generateLineChartOptions = (
    symbol: string,
    prices: HistoricalPrice[],
    theme: 'light' | 'dark' = 'light',
    realTimeMode: boolean = false
  ) => {
    const isDark = theme === 'dark'
    
    const data = prices.map(price => ({
      x: new Date(price.date).getTime(),
      y: price.close
    }))

    return {
      series: [{
        name: 'Price',
        data: data
      }],
      chart: {
        type: 'line',
        height: 300,
        background: 'transparent',
        toolbar: {
          show: false
        },
        animations: {
          enabled: !realTimeMode,
          easing: 'easeinout',
          speed: realTimeMode ? 100 : 800
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#3b82f6']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280'
          }
        },
        axisBorder: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280'
          },
          formatter: (value: number) => `$${value.toFixed(2)}`
        }
      },
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb'
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        x: {
          format: 'dd MMM yyyy HH:mm'
        },
        y: {
          formatter: (value: number) => `$${value.toFixed(2)}`
        }
      },
      title: {
        text: realTimeMode ? `${symbol} (Live) 🔴` : symbol,
        style: {
          color: isDark ? '#ffffff' : '#374151'
        }
      }
    }
  }

  return {
    getChartData,
    getHistoricalPrices,
    getAvailableSymbols,
    generateCandlestickOptions,
    generateLineChartOptions,
    subscribeToRealTimeChart,
    getRealTimeChartData,
    updateRealTimeChart
  }
} 