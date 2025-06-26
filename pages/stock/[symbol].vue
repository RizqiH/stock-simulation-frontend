<template>
  <UContainer>
    <!-- Back Navigation -->
    <div class="py-4">
      <UButton @click="$router.back()" variant="ghost" icon="i-heroicons-arrow-left">
        Back to Market
      </UButton>
    </div>

    <!-- Stock Header -->
    <section class="py-8" v-if="stock">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-6">
          <UAvatar
            :text="stock.symbol.charAt(0)"
            size="xl"
            class="bg-gradient-to-br from-primary-500 to-purple-600"
          />
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ stock.symbol }}
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-400">
              {{ stock.name }}
            </p>
          </div>
        </div>
        
        <div class="text-right">
          <div class="flex items-center justify-end gap-2">
            <p class="text-4xl font-bold text-gray-900 dark:text-white transition-all duration-300" :class="priceFlash">
              ${{ stock?.current_price?.toFixed(2) || '0.00' }}
            </p>
            <!-- Real-time pulse indicator -->
            <div v-if="isConnected" class="w-3 h-3 bg-green-500 rounded-full animate-pulse opacity-60"></div>
          </div>
          <div class="flex items-center justify-end gap-2 mt-2">
            <UBadge
              :color="stockChange >= 0 ? 'emerald' : 'red'"
              variant="soft"
              size="lg"
            >
              <UIcon 
                :name="stockChange >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
                class="w-4 h-4 mr-1"
              />
              {{ stockChange >= 0 ? '+' : '' }}${{ typeof stockChange === 'number' ? Math.abs(stockChange).toFixed(2) : '0.00' }}
            </UBadge>
            <span v-if="isConnected" class="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Trading Actions Section -->
    <section class="py-6" v-if="stock && !isLoading">
      <UCard>
        <template #header>
          <h3 class="text-xl font-bold">Trading Actions</h3>
        </template>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Current Position -->
          <div class="lg:col-span-1">
            <div v-if="portfolioLoading" class="space-y-2">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-6 w-16" />
            </div>
            <div v-else-if="userHolding">
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Position</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Shares Owned:</span>
                  <span class="font-semibold">{{ userHolding.quantity }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Avg. Price:</span>
                  <span class="font-semibold">${{ typeof userHolding.averagePrice === 'number' ? userHolding.averagePrice.toFixed(2) : '0.00' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                  <span class="font-semibold">${{ typeof userHolding.currentValue === 'number' ? userHolding.currentValue.toFixed(2) : '0.00' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">P&L:</span>
                  <span :class="[
                    'font-semibold',
                    (userHolding.profitLoss || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  ]">
                    {{ (userHolding.profitLoss || 0) >= 0 ? '+' : '' }}${{ typeof userHolding.profitLoss === 'number' ? Math.abs(userHolding.profitLoss).toFixed(2) : '0.00' }}
                    ({{ (userHolding.profitLossPct || 0) >= 0 ? '+' : '' }}{{ typeof userHolding.profitLossPct === 'number' ? userHolding.profitLossPct.toFixed(2) : '0.00' }}%)
                  </span>
                </div>
              </div>
            </div>
            <div v-else>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Position</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">You don't own shares of {{ symbol }}</p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="lg:col-span-2">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Buy Button -->
              <UButton
                @click="openBuyModal"
                color="emerald"
                variant="solid"
                size="lg"
                icon="i-heroicons-plus"
                class="flex-1"
                :loading="buyLoading"
              >
                Buy {{ symbol }}
              </UButton>
              
              <!-- Sell Button -->
              <UButton
                @click="openSellModal"
                color="red"
                variant="solid"
                size="lg"
                icon="i-heroicons-minus"
                class="flex-1"
                :disabled="!userHolding || userHolding.quantity <= 0"
                :loading="sellLoading"
              >
                Sell {{ symbol }}
              </UButton>
            </div>
            
            <div v-if="!userHolding" class="mt-2">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                You need to own shares of {{ symbol }} to sell
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Interactive Chart Section -->
    <section class="py-6" v-if="stock && !isLoading">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-bold">Price Chart</h3>
              <!-- Real-time indicator -->
              <div v-if="isConnected" class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm text-green-600 dark:text-green-400 font-medium">LIVE</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span class="text-sm text-gray-500 dark:text-gray-400">Offline</span>
              </div>
            </div>
            <!-- Mobile-friendly period selector -->
            <div class="flex gap-1 overflow-x-auto lg:overflow-visible">
              <UButton
                v-for="period in chartPeriods"
                :key="period.value"
                @click="selectedPeriod = period.value"
                :variant="selectedPeriod === period.value ? 'solid' : 'outline'"
                size="sm"
                class="flex-shrink-0"
              >
                {{ period.label }}
              </UButton>
            </div>
          </div>
        </template>
        
        <div v-if="chartLoading" class="flex items-center justify-center" :class="chartContainerClass">
          <div class="text-center">
            <USkeleton class="h-8 w-48 mx-auto mb-4" />
            <USkeleton class="h-32 lg:h-64 w-full" />
          </div>
        </div>
        
        <div v-else-if="chartError" class="flex items-center justify-center" :class="chartContainerClass">
          <div class="text-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 lg:w-16 lg:h-16 text-red-500 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400 text-sm lg:text-base">{{ chartError }}</p>
            <UButton @click="loadChartData" variant="outline" class="mt-4" size="sm">
              Retry
            </UButton>
          </div>
        </div>
        
        <div v-else-if="chartOptions" class="w-full">
          <ClientOnly>
            <apexchart
              type="candlestick"
              :height="chartHeight"
              :options="mobileChartOptions"
              :series="chartOptions.series"
            />
            <template #fallback>
              <div :class="chartContainerClass" class="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p class="text-gray-600 dark:text-gray-400">Loading chart...</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </UCard>
    </section>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 text-center">
      <div class="space-y-4">
        <USkeleton class="h-8 w-48 mx-auto" />
        <USkeleton class="h-6 w-32 mx-auto" />
        <USkeleton class="h-16 w-64 mx-auto" />
        <USkeleton class="h-64 w-full" />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="py-16 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Stock Not Found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
      <UButton @click="$router.push('/market')" variant="outline">
        Back to Market
      </UButton>
    </div>

    <!-- Buy Modal -->
    <UModal v-model="showBuyModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Buy {{ symbol }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showBuyModal = false" />
          </div>
        </template>

        <div class="p-4">
          <div class="space-y-4">
            <!-- Stock Info -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">{{ symbol }}</span>
                <span class="text-lg font-bold">${{ stock?.current_price?.toFixed(2) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ stock?.name }}</p>
            </div>

            <!-- Quantity Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <UInput
                v-model="buyQuantity"
                type="number"
                min="1"
                placeholder="Enter number of shares"
                :disabled="buyLoading"
              />
            </div>

            <!-- Total Cost -->
            <div v-if="buyQuantity && stock?.current_price" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div class="flex justify-between">
                <span class="font-medium">Total Cost:</span>
                <span class="text-lg font-bold">${{ (buyQuantity * stock.current_price).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="outline" @click="showBuyModal = false" :disabled="buyLoading">
              Cancel
            </UButton>
            <UButton 
              color="emerald" 
              @click="executeBuy" 
              :loading="buyLoading"
              :disabled="!buyQuantity || buyQuantity <= 0"
            >
              Buy {{ buyQuantity || 0 }} Shares
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Sell Modal -->
    <UModal v-model="showSellModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Sell {{ symbol }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showSellModal = false" />
          </div>
        </template>

        <div class="p-4">
          <div class="space-y-4">
            <!-- Stock Info -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">{{ symbol }}</span>
                <span class="text-lg font-bold">${{ stock?.current_price?.toFixed(2) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ stock?.name }}</p>
              <div v-if="userHolding" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  You own {{ userHolding.quantity }} shares (Avg. ${{ typeof userHolding.averagePrice === 'number' ? userHolding.averagePrice.toFixed(2) : '0.00' }})
                </p>
              </div>
            </div>

            <!-- Quantity Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity to Sell
              </label>
              <UInput
                v-model="sellQuantity"
                type="number"
                min="1"
                :max="userHolding?.quantity || 0"
                placeholder="Enter number of shares"
                :disabled="sellLoading"
              />
              <p v-if="userHolding" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum: {{ userHolding.quantity }} shares
              </p>
            </div>

            <!-- Total Proceeds -->
            <div v-if="sellQuantity && stock?.current_price" class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div class="flex justify-between">
                <span class="font-medium">Total Proceeds:</span>
                <span class="text-lg font-bold">${{ (sellQuantity * stock.current_price).toFixed(2) }}</span>
              </div>
              <div v-if="userHolding" class="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                <div class="flex justify-between text-sm">
                  <span>Estimated P&L:</span>
                  <span :class="[
                    'font-medium',
                    sellQuantity && stock?.current_price && userHolding?.averagePrice && 
                    (sellQuantity * stock.current_price - sellQuantity * userHolding.averagePrice) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  ]">
                    {{ sellQuantity && stock?.current_price && userHolding?.averagePrice && 
                       (sellQuantity * stock.current_price - sellQuantity * userHolding.averagePrice) >= 0 ? '+' : '' }}${{ 
                      sellQuantity && stock?.current_price && userHolding?.averagePrice ? 
                      (sellQuantity * stock.current_price - sellQuantity * userHolding.averagePrice).toFixed(2) : '0.00'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="outline" @click="showSellModal = false" :disabled="sellLoading">
              Cancel
            </UButton>
            <UButton 
              color="red" 
              @click="executeSell" 
              :loading="sellLoading"
              :disabled="!sellQuantity || sellQuantity <= 0 || (userHolding && sellQuantity > userHolding.quantity)"
            >
              Sell {{ sellQuantity || 0 }} Shares
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup>
const route = useRoute()
const symbol = route.params.symbol

// Composables
const { user } = useAuth()
const { stocks, portfolio, transactions } = useApi()
const { getChartData, generateCandlestickOptions } = useCharts()
const { success, error: notifyError } = useNotifications()
const { subscribeToPriceUpdates, isConnected } = useWebSocket()
const colorMode = useColorMode()

// SEO
useHead({
  title: `${symbol} - Stock Details - StockSim Pro`
})

// Reactive data
const stock = ref(null)
const isLoading = ref(true)
const error = ref('')

// Chart data
const chartData = ref(null)
const chartOptions = ref(null)
const chartLoading = ref(false)
const chartError = ref('')
const selectedPeriod = ref('30D')

// Portfolio data
const userHolding = ref(null)
const portfolioLoading = ref(false)

// Trading modals
const showBuyModal = ref(false)
const showSellModal = ref(false)

// Trading data
const buyQuantity = ref('')
const sellQuantity = ref('')
const buyLoading = ref(false)
const sellLoading = ref(false)

// Real-time animation
const priceFlash = ref('')

// Chart periods
const chartPeriods = [
  { label: '7D', value: '7D' },
  { label: '30D', value: '30D' },
  { label: '90D', value: '90D' },
  { label: '1Y', value: '1Y' }
]

// Computed
const stockChange = computed(() => {
  if (!stock.value || typeof stock.value.current_price !== 'number' || typeof stock.value.previous_close !== 'number') {
    return 0
  }
  return stock.value.current_price - stock.value.previous_close
})

// Mobile chart optimizations
const chartHeight = computed(() => {
  if (process.client && window.innerWidth < 1024) {
    return 250 // Mobile height
  }
  return 400 // Desktop height
})

const chartContainerClass = computed(() => {
  return 'h-64 lg:h-96'
})

const mobileChartOptions = computed(() => {
  if (!chartOptions.value) return null
  
  // Create mobile-optimized chart options
  const baseOptions = { ...chartOptions.value }
  
  if (process.client && window.innerWidth < 1024) {
    return {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        toolbar: {
          show: false // Hide toolbar on mobile
        },
        zoom: {
          enabled: false // Disable zoom on mobile for better touch experience
        }
      },
      xaxis: {
        ...baseOptions.xaxis,
        labels: {
          ...baseOptions.xaxis?.labels,
          style: {
            fontSize: '10px'
          }
        }
      },
      yaxis: {
        ...baseOptions.yaxis,
        labels: {
          ...baseOptions.yaxis?.labels,
          style: {
            fontSize: '10px'
          }
        }
      },
      legend: {
        show: false // Hide legend on mobile to save space
      },
      tooltip: {
        ...baseOptions.tooltip,
        style: {
          fontSize: '12px'
        }
      }
    }
  }
  
  return baseOptions
})

// Methods
const loadStockData = async () => {
  try {
    isLoading.value = true
    
    const stockResult = await stocks.getBySymbol(symbol)
    if (stockResult.data?.stock) {
      stock.value = stockResult.data.stock
      // Load chart data and user position in parallel
      await Promise.all([
        loadChartData(),
        loadUserPosition()
      ])
    } else {
      error.value = 'Stock not found'
    }
  } catch (err) {
    error.value = err.message || 'Failed to load stock data'
  } finally {
    isLoading.value = false
  }
}

const loadUserPosition = async () => {
  try {
    portfolioLoading.value = true
    
    const portfolioResult = await portfolio.get()
    
    if (portfolioResult.data?.portfolio?.holdings) {
      const holding = portfolioResult.data.portfolio.holdings.find(item => 
        (item.stock_symbol || item.stockSymbol) === symbol
      )
      
      if (holding) {
        userHolding.value = {
          quantity: holding.quantity,
          averagePrice: holding.average_price || holding.averagePrice,
          currentPrice: holding.current_price || holding.currentPrice,
          totalCost: holding.total_cost || holding.totalCost,
          currentValue: holding.current_value || holding.currentValue,
          profitLoss: holding.profit_loss || holding.profitLoss,
          profitLossPct: holding.profit_loss_pct || holding.profitLossPct
        }
      } else {
        userHolding.value = null
      }
    } else {
      userHolding.value = null
    }
  } catch (err) {
    console.error('❌ [stock-detail] Failed to load user position:', err)
  } finally {
    portfolioLoading.value = false
  }
}

const loadChartData = async () => {
  try {
    chartLoading.value = true
    chartError.value = ''
    
    const result = await getChartData(symbol, { period: selectedPeriod.value })
    
    if (result.data && result.data.prices && Array.isArray(result.data.prices)) {
      chartData.value = result.data
      
      // Validate data before generating chart
      if (result.data.prices.length > 0) {
        // Generate chart options
        const theme = colorMode.value === 'dark' ? 'dark' : 'light'
        
        chartOptions.value = generateCandlestickOptions(
          symbol,
          result.data.prices,
          result.data.indicators || {},
          theme
        )
      } else {
        chartError.value = `No historical data available for ${symbol}`
      }
    } else {
      chartError.value = result.error || `No chart data available for ${symbol}. Available symbols: AAPL, GOOGL, MSFT, AMZN`
    }
  } catch (err) {
    console.error('❌ [stock-detail] Chart loading error:', err)
    chartError.value = err.message || 'Failed to load chart data'
  } finally {
    chartLoading.value = false
  }
}

// Trading functions
const openBuyModal = () => {
  buyQuantity.value = ''
  showBuyModal.value = true
}

const openSellModal = () => {
  if (!userHolding.value || userHolding.value.quantity <= 0) {
    notifyError('You don\'t have shares to sell')
    return
  }
  sellQuantity.value = ''
  showSellModal.value = true
}

const executeBuy = async () => {
  try {
    buyLoading.value = true
    
    const request = {
      stock_symbol: symbol,
      quantity: parseInt(buyQuantity.value)
    }
    
    console.log('🔍 [stock-detail] Executing buy order:', request)
    
    const result = await transactions.buy(request)
    
    if (result.data) {
      success(`Successfully bought ${buyQuantity.value} shares of ${symbol}`)
      showBuyModal.value = false
      buyQuantity.value = ''
      
      // Refresh user position
      await loadUserPosition()
    } else {
      notifyError(result.error || 'Failed to execute buy order')
    }
  } catch (err) {
    console.error('Buy order failed:', err)
    notifyError(err.message || 'Failed to execute buy order')
  } finally {
    buyLoading.value = false
  }
}

const executeSell = async () => {
  try {
    sellLoading.value = true
    
    const request = {
      stock_symbol: symbol,
      quantity: parseInt(sellQuantity.value)
    }
    
    console.log('🔍 [stock-detail] Executing sell order:', request)
    
    const result = await transactions.sell(request)
    
    if (result.data) {
      success(`Successfully sold ${sellQuantity.value} shares of ${symbol}`)
      showSellModal.value = false
      sellQuantity.value = ''
      
      // Refresh user position
      await loadUserPosition()
    } else {
      notifyError(result.error || 'Failed to execute sell order')
    }
  } catch (err) {
    console.error('Sell order failed:', err)
    notifyError(err.message || 'Failed to execute sell order')
  } finally {
    sellLoading.value = false
  }
}

// Watch for period changes
watch(selectedPeriod, () => {
  if (stock.value) {
    loadChartData()
  }
})

// Watch for theme changes
watch(() => colorMode.value, () => {
  if (chartData.value) {
    const theme = colorMode.value === 'dark' ? 'dark' : 'light'
    chartOptions.value = generateCandlestickOptions(
      symbol,
      chartData.value.prices,
      chartData.value.indicators,
      theme
    )
  }
})

// Real-time price updates
let unsubscribeFromPriceUpdates = null

const handlePriceUpdate = (priceUpdate) => {
  console.log(`📈 [stock-detail] Received price update for ${priceUpdate.symbol}:`, priceUpdate)
  
  // Update stock price if it matches current symbol
  if (priceUpdate.symbol === symbol && stock.value) {
    const oldPrice = stock.value.current_price
    const newPrice = priceUpdate.price
    
    // Update prices
    stock.value.current_price = newPrice
    stock.value.previous_close = priceUpdate.previous_close || stock.value.previous_close
    
    // Trigger flash animation based on price change
    if (oldPrice !== newPrice) {
      if (newPrice > oldPrice) {
        priceFlash.value = 'flash-green'
      } else if (newPrice < oldPrice) {
        priceFlash.value = 'flash-red'
      }
      
      // Clear flash after animation
      setTimeout(() => {
        priceFlash.value = ''
      }, 1000)
    }
    
    // Update chart with new data point if chart is loaded
    if (chartOptions.value && chartData.value) {
      updateChartWithRealTimeData(priceUpdate)
    }
  }
}

const updateChartWithRealTimeData = (priceUpdate) => {
  try {
    // Create new price data point
    const now = new Date()
    const newPricePoint = {
      id: Date.now(),
      symbol: priceUpdate.symbol,
      date: now.toISOString(),
      open: priceUpdate.open || priceUpdate.price,
      high: priceUpdate.high || priceUpdate.price,
      low: priceUpdate.low || priceUpdate.price,
      close: priceUpdate.price,
      volume: priceUpdate.volume || 0,
      created_at: now.toISOString()
    }
    
    // Add to existing chart data
    if (chartData.value && chartData.value.prices) {
      // Remove old data points from today (to avoid duplicates)
      const today = now.toISOString().split('T')[0]
      chartData.value.prices = chartData.value.prices.filter(price => 
        !price.date.startsWith(today)
      )
      
      // Add new data point
      chartData.value.prices.push(newPricePoint)
      
      // Keep only recent data (e.g., last 100 points for performance)
      if (chartData.value.prices.length > 100) {
        chartData.value.prices = chartData.value.prices.slice(-100)
      }
      
      // Regenerate chart options with updated data
      const theme = colorMode.value === 'dark' ? 'dark' : 'light'
      chartOptions.value = generateCandlestickOptions(
        symbol,
        chartData.value.prices,
        chartData.value.indicators || {},
        theme,
        true // realTimeMode
      )
      
      console.log(`📊 [stock-detail] Chart updated with real-time data for ${symbol}`)
    }
  } catch (error) {
    console.error('❌ [stock-detail] Failed to update chart with real-time data:', error)
  }
}

const subscribeToRealTimeUpdates = () => {
  if (unsubscribeFromPriceUpdates) {
    unsubscribeFromPriceUpdates()
  }
  
  console.log(`🔔 [stock-detail] Subscribing to real-time updates for ${symbol}`)
  unsubscribeFromPriceUpdates = subscribeToPriceUpdates(symbol, handlePriceUpdate)
}

// Load data on mount
onMounted(() => {
  loadStockData()
  
  // Subscribe to real-time updates after a short delay to ensure data is loaded
  setTimeout(() => {
    subscribeToRealTimeUpdates()
  }, 1000)
})

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribeFromPriceUpdates) {
    unsubscribeFromPriceUpdates()
    console.log(`🔕 [stock-detail] Unsubscribed from real-time updates for ${symbol}`)
  }
})
</script>

<style scoped>
/* Component-specific styles */

/* Price flash animations */
.flash-green {
  @apply bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300;
  animation: flash-green 1s ease-in-out;
}

.flash-red {
  @apply bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300;
  animation: flash-red 1s ease-in-out;
}

@keyframes flash-green {
  0% { 
    background-color: rgb(34, 197, 94); 
    color: white;
    transform: scale(1.05);
  }
  50% { 
    background-color: rgb(34, 197, 94, 0.5); 
    transform: scale(1.02);
  }
  100% { 
    background-color: transparent; 
    color: inherit;
    transform: scale(1);
  }
}

@keyframes flash-red {
  0% { 
    background-color: rgb(239, 68, 68); 
    color: white;
    transform: scale(1.05);
  }
  50% { 
    background-color: rgb(239, 68, 68, 0.5); 
    transform: scale(1.02);
  }
  100% { 
    background-color: transparent; 
    color: inherit;
    transform: scale(1);
  }
}
</style> 