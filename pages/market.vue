<template>
  <UContainer>
    <!-- Modern Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Live Market Data
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Real-time stock prices and market information
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <UButton to="/advanced-orders" size="lg" icon="i-heroicons-cog-6-tooth">
            Advanced Trading
          </UButton>
          <UBadge color="emerald" variant="solid" size="lg">
            <UIcon name="i-heroicons-wifi" class="w-4 h-4 mr-2" />
            Market Open
          </UBadge>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {{ lastUpdated }}
          </p>
        </div>
      </div>
    </section>

    <!-- Market Controls -->
    <section class="py-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Search stocks by symbol or name..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
          />
        </div>
        
        <!-- Filters -->
        <div class="flex gap-2">
          <USelectMenu
            v-model="sortBy"
            :options="sortOptions"
            placeholder="Sort by"
            size="lg"
            class="w-48"
          />
          <UButton
            @click="refreshData"
            :disabled="isRefreshing"
            variant="outline"
            icon="i-heroicons-arrow-path"
            :loading="isRefreshing"
            size="lg"
          >
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Advanced Trading Info -->
    <section class="py-4">
      <UAlert
        color="blue"
        variant="soft"
        icon="i-heroicons-information-circle"
        title="Advanced Trading Available"
        description="Access sophisticated order types including Limit, Stop Loss, Take Profit, and more with our Advanced Trading platform."
        :actions="[{
          label: 'Start Advanced Trading',
          color: 'primary',
          to: '/advanced-orders'
        }]"
      />
    </section>

    <!-- Market Stats -->
    <section class="py-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{{ marketStats.trend }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Market Trend</p>
        </UCard>
        
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ filteredStocks.length }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Available Stocks</p>
        </UCard>
        
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">{{ marketStats.volume }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Volume Today</p>
        </UCard>
        
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-users" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">{{ marketStats.traders }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Active Traders</p>
        </UCard>
      </div>
    </section>

    <!-- Stocks Table -->
    <section class="pb-16">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">
              Stock Listings ({{ filteredStocks.length }})
            </h2>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 10" :key="i" class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            <div class="flex items-center gap-4">
              <USkeleton class="h-12 w-12 rounded-xl" />
              <div class="space-y-2">
                <USkeleton class="h-4 w-16" />
                <USkeleton class="h-3 w-32" />
              </div>
            </div>
            <div class="text-right space-y-2">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-3 w-16" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredStocks.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No stocks found</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'No stocks available at the moment' }}
          </p>
          <UButton @click="refreshData" variant="outline">
            Refresh Data
          </UButton>
        </div>

        <!-- Stocks Display - Responsive Layout -->
        <div v-else>
          <!-- Mobile Card Layout (visible on mobile only) -->
          <div class="lg:hidden space-y-3 p-4">
            <div
              v-for="stock in paginatedStocks"
              :key="stock.symbol"
              class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <!-- Stock Header Row -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2.5 flex-1 min-w-0">
                  <UAvatar
                    :text="stock.symbol.charAt(0)"
                    size="sm"
                    class="bg-gradient-to-br from-primary-500 to-purple-600 flex-shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <h3 class="font-bold text-base text-gray-900 dark:text-white leading-tight">{{ stock.symbol }}</h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 truncate" :title="stock.name">
                      {{ stock.name }}
                    </p>
                  </div>
                </div>
                
                <!-- Price & Change (Right side) -->
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    ${{ stock.current_price.toFixed(2) }}
                  </p>
                  <div class="flex items-center justify-end gap-1">
                    <span :class="getChangeColor(stock)" class="text-sm font-semibold">
                      {{ getChangeText(stock) }}
                    </span>
                    <UBadge
                      :color="getChangeColor(stock).includes('emerald') ? 'emerald' : 'red'"
                      variant="soft"
                      size="sm"
                    >
                      {{ getChangePercentage(stock) }}%
                    </UBadge>
                  </div>
                </div>
              </div>

              <!-- Quick Stats Row -->
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                <span>Vol: {{ formatVolume(stock.volume) }}</span>
                <span>MCap: {{ formatMarketCap(stock.market_cap) }}</span>
                <UButton
                  @click="toggleWatchlist(stock.symbol)"
                  :color="isInWatchlist(stock.symbol) ? 'red' : 'amber'"
                  variant="ghost"
                  size="2xs"
                  :icon="isInWatchlist(stock.symbol) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                />
              </div>

              <!-- Action Buttons Row -->
              <div class="flex gap-2">
                <UButton
                  @click="openTradeModal(stock, 'buy')"
                  color="emerald"
                  variant="solid"
                  size="sm"
                  icon="i-heroicons-plus"
                  class="flex-1 text-sm"
                >
                  Buy
                </UButton>
                <UButton
                  @click="viewDetails(stock)"
                  color="primary"
                  variant="outline"
                  size="sm"
                  icon="i-heroicons-eye"
                  class="flex-1 text-sm"
                >
                  Chart
                </UButton>
                <UButton
                  :to="`/advanced-orders?symbol=${stock.symbol}`"
                  color="gray"
                  variant="outline"
                  size="sm"
                  icon="i-heroicons-cog-6-tooth"
                  class="px-3"
                  :title="`Advanced orders for ${stock.symbol}`"
                >
                  <span class="sr-only">Advanced orders for {{ stock.symbol }}</span>
                </UButton>
              </div>
            </div>
          </div>

          <!-- Desktop Table Layout (hidden on mobile) -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Cap</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="stock in paginatedStocks"
                  :key="stock.symbol"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :text="stock.symbol.charAt(0)"
                        size="sm"
                        class="bg-gradient-to-br from-primary-500 to-purple-600"
                      />
                      <span class="font-bold text-gray-900 dark:text-white">{{ stock.symbol }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-gray-900 dark:text-white">{{ stock.name }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="font-bold text-gray-900 dark:text-white">${{ stock.current_price.toFixed(2) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex flex-col items-end">
                      <span :class="getChangeColor(stock)" class="font-semibold">
                        {{ getChangeText(stock) }}
                      </span>
                      <UBadge
                        :color="getChangeColor(stock).includes('emerald') ? 'emerald' : 'red'"
                        variant="soft"
                        size="sm"
                      >
                        {{ getChangePercentage(stock) }}%
                      </UBadge>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-gray-600 dark:text-gray-400">{{ formatVolume(stock.volume) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-gray-600 dark:text-gray-400">{{ formatMarketCap(stock.market_cap) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center gap-2">
                      <UButton
                        @click="openTradeModal(stock, 'buy')"
                        color="emerald"
                        variant="outline"
                        size="sm"
                        icon="i-heroicons-plus"
                      >
                        Buy
                      </UButton>
                      <UButton
                        :to="`/advanced-orders?symbol=${stock.symbol}`"
                        color="primary"
                        variant="outline"
                        size="sm"
                        icon="i-heroicons-cog-6-tooth"
                      >
                        Advanced
                      </UButton>
                      <UButton
                        @click="toggleWatchlist(stock.symbol)"
                        :color="isInWatchlist(stock.symbol) ? 'red' : 'amber'"
                        variant="ghost"
                        size="sm"
                        :icon="isInWatchlist(stock.symbol) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                      />
                      <UButton
                        @click="viewDetails(stock)"
                        variant="ghost"
                        size="sm"
                        icon="i-heroicons-eye"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <template #footer>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredStocks.length) }} of {{ filteredStocks.length }} stocks
            </p>
            <UPagination
              v-model="currentPage"
              :page-count="itemsPerPage"
              :total="filteredStocks.length"
            />
          </div>
        </template>
      </UCard>
    </section>

    <!-- Buy/Sell Modal -->
    <UModal v-model="showTradeModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold">
              {{ tradeAction === 'buy' ? 'Buy' : 'Sell' }} {{ selectedStock?.symbol }}
            </h3>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Stock Info -->
          <UCard class="border-primary-200 dark:border-primary-700/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UAvatar
                  :text="selectedStock?.symbol?.charAt(0)"
                  class="bg-gradient-to-br from-primary-500 to-purple-600"
                />
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ selectedStock?.symbol }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedStock?.name }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-xl text-gray-900 dark:text-white">
                  ${{ selectedStock?.current_price?.toFixed(2) }}
                </p>
                <UBadge
                  :color="stockChange >= 0 ? 'emerald' : 'red'"
                  variant="soft"
                >
                  {{ stockChange >= 0 ? '+' : '' }}{{ stockChangePct.toFixed(2) }}%
                </UBadge>
              </div>
            </div>
          </UCard>

          <!-- Trade Form -->
          <UForm :schema="tradeSchema" :state="tradeForm" @submit="handleTrade" class="space-y-4">
            <UFormGroup label="Quantity" name="quantity" required>
              <UInput
                v-model.number="tradeForm.quantity"
                type="number"
                placeholder="Enter quantity"
                min="1"
                step="1"
                :disabled="isTrading"
              />
            </UFormGroup>

            <UFormGroup label="Total Amount">
              <UInput
                :model-value="`$${totalAmount.toLocaleString()}`"
                readonly
                :color="user?.balance && totalAmount > user.balance ? 'red' : 'gray'"
              />
              <template #help>
                <p v-if="user?.balance && totalAmount > user.balance" class="text-red-600 dark:text-red-400">
                  Insufficient funds. Available balance: ${{ user.balance.toLocaleString() }}
                </p>
              </template>
            </UFormGroup>

            <!-- Error Display -->
            <UAlert
              v-if="tradeError"
              color="red"
              variant="solid"
              :title="tradeError"
            />

            <div class="flex gap-3 pt-4">
              <UButton
                type="submit"
                :disabled="isTrading || !tradeForm.quantity || (user?.balance && totalAmount > user.balance)"
                class="flex-1"
                :loading="isTrading"
              >
                {{ tradeAction === 'buy' ? 'Buy' : 'Sell' }} Stock
              </UButton>
              <UButton
                type="button"
                @click="showTradeModal = false"
                :disabled="isTrading"
                variant="outline"
              >
                Cancel
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup>
import { z } from 'zod'

// SEO
useHead({
  title: 'Live Market Data - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'View real-time stock prices, market data, and trading information. Search and filter stocks by category, price, and performance.'
    }
  ]
})

// Composables
const { user } = useAuth()
const { stocks, transactions } = useApi()
const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
const { success: showSuccessNotification, error: showErrorNotification } = useNotifications()

// Reactive data
const allStocks = ref([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const searchQuery = ref('')
const sortBy = ref('symbol')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Trade modal
const showTradeModal = ref(false)
const selectedStock = ref(null)
const tradeAction = ref('buy')
const isTrading = ref(false)
const tradeError = ref('')
const tradeForm = reactive({
  quantity: 1
})

// Trade schema
const tradeSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1')
})

// Market stats
const marketStats = ref({
  trend: '+2.4%',
  volume: '$2.4B',
  traders: '1,247'
})

// Sort options
const sortOptions = [
  { label: 'Symbol', value: 'symbol' },
  { label: 'Price', value: 'current_price' },
  { label: 'Change %', value: 'change_pct' },
  { label: 'Volume', value: 'volume' },
  { label: 'Market Cap', value: 'market_cap' }
]

// Computed properties
const lastUpdated = computed(() => {
  return new Date().toLocaleTimeString()
})

const filteredStocks = computed(() => {
  let filtered = allStocks.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(stock => 
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal)
    }
    return bVal - aVal // Descending for numbers
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredStocks.value.length / itemsPerPage.value)
})

const paginatedStocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStocks.value.slice(start, end)
})

const stockChange = computed(() => {
  if (!selectedStock.value) return 0
  return selectedStock.value.current_price - selectedStock.value.previous_close
})

const stockChangePct = computed(() => {
  if (!selectedStock.value || selectedStock.value.previous_close === 0) return 0
  return (stockChange.value / selectedStock.value.previous_close) * 100
})

const totalAmount = computed(() => {
  if (!selectedStock.value || !tradeForm.quantity) return 0
  return selectedStock.value.current_price * tradeForm.quantity
})

// Watch for filter changes to reset pagination
watch([searchQuery, sortBy], () => {
  currentPage.value = 1
})

// Methods
const loadStocks = async () => {
  try {
    isLoading.value = true
    const result = await stocks.getAll()
    if (result.data) {
      allStocks.value = result.data.stocks || []
    }
  } catch (error) {
    console.error('Failed to load stocks:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await loadStocks()
  } finally {
    isRefreshing.value = false
  }
}

const openTradeModal = (stock, action) => {
  selectedStock.value = stock
  tradeAction.value = action
  tradeForm.quantity = 1
  tradeError.value = ''
  showTradeModal.value = true
}

const handleTrade = async () => {
  if (!selectedStock.value) return
  
  try {
    isTrading.value = true
    tradeError.value = ''

    // Validate inputs
    const quantity = parseInt(tradeForm.quantity)
    if (!quantity || quantity < 1) {
      tradeError.value = 'Quantity must be at least 1'
      return
    }

    if (!selectedStock.value.symbol) {
      tradeError.value = 'Invalid stock symbol'
      return
    }

    const tradeData = {
      stock_symbol: selectedStock.value.symbol,
      quantity: quantity
    }

    console.log('🔍 [handleTrade] Sending trade data:', tradeData)

    let result
    if (tradeAction.value === 'buy') {
      result = await transactions.buy(tradeData)
    } else {
      result = await transactions.sell(tradeData)
    }

    console.log('🔍 [handleTrade] API result:', result)

    if (result.error) {
      tradeError.value = result.error
      showErrorNotification(
        `${tradeAction.value === 'buy' ? 'Buy' : 'Sell'} Order Failed`,
        result.error
      )
    } else {
      showTradeModal.value = false
      
      // Show success notification
      const actionText = tradeAction.value === 'buy' ? 'Bought' : 'Sold'
      showSuccessNotification(
        `${actionText} ${quantity} shares of ${selectedStock.value.symbol}`,
        `Transaction completed successfully`
      )
      
      console.log('Trade successful:', result.data)
      
      // Optionally refresh user data
      await refreshData()
    }
  } catch (error) {
    console.error('❌ [handleTrade] Error:', error)
    tradeError.value = error.message || 'Trade failed'
  } finally {
    isTrading.value = false
  }
}

const viewDetails = (stock) => {
  navigateTo(`/stock/${stock.symbol}`)
}

const getChangeColor = (stock) => {
  const change = stock.current_price - stock.previous_close
  return change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
}

const getChangeText = (stock) => {
  const change = stock.current_price - stock.previous_close
  return `${change >= 0 ? '+' : ''}$${Math.abs(change).toFixed(2)}`
}

const getChangePercentage = (stock) => {
  if (!stock.previous_close) return '0.00'
  const change = stock.current_price - stock.previous_close
  const percentage = (change / stock.previous_close) * 100
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}`
}

const formatVolume = (volume) => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

const formatMarketCap = (marketCap) => {
  if (marketCap >= 1000000000) {
    return `${(marketCap / 1000000000).toFixed(1)}B`
  } else if (marketCap >= 1000000) {
    return `${(marketCap / 1000000).toFixed(1)}M`
  }
  return marketCap.toString()
}

const toggleWatchlist = async (symbol) => {
  if (isInWatchlist(symbol)) {
    removeFromWatchlist(symbol)
  } else {
    await addToWatchlist(symbol)
  }
}

// Load data on mount
onMounted(() => {
  loadStocks()
})
</script>

<style scoped>
/* Component-specific styles */
</style>

