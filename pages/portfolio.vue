<template>
  <UContainer>
    <!-- Modern Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-briefcase" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              My Portfolio
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Track your investments and portfolio performance
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <UButton
            @click="refreshPortfolio"
            :loading="isRefreshing"
            variant="outline"
            icon="i-heroicons-arrow-path"
            :disabled="isRefreshing"
          >
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </UButton>
          <UButton
            to="/market"
            icon="i-heroicons-plus"
          >
            Add Investment
          </UButton>
        </div>
      </div>
    </section>

    <!-- Portfolio Summary -->
    <section class="py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Value - Featured Card -->
        <div class="lg:col-span-2">
          <UCard class="p-8 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Portfolio Value</h3>
                <p class="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  ${{ portfolioSummary.totalValue.toLocaleString() }}
                </p>
                <div class="flex items-center gap-2">
                  <UBadge 
                    :color="portfolioSummary.totalProfitPct >= 0 ? 'emerald' : 'red'"
                    variant="soft"
                    size="lg"
                  >
                    <UIcon 
                      :name="portfolioSummary.totalProfitPct >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
                      class="w-4 h-4 mr-1"
                    />
                    {{ portfolioSummary.totalProfitPct >= 0 ? '+' : '' }}${{ Math.abs(portfolioSummary.totalProfit).toLocaleString() }}
                    ({{ portfolioSummary.totalProfitPct >= 0 ? '+' : '' }}{{ portfolioSummary.totalProfitPct.toFixed(2) }}%)
                  </UBadge>
                </div>
              </div>
              <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <UIcon name="i-heroicons-chart-pie" class="w-10 h-10 text-white" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Available Cash -->
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-banknotes" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Available Cash</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ userBalance.toLocaleString() }}</p>
        </UCard>

        <!-- Total Invested -->
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Invested</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ portfolioSummary.totalCost.toLocaleString() }}</p>
        </UCard>
      </div>

      <!-- Performance Chart -->
      <PortfolioPerformanceChart 
        :height="450"
        :real-time="true"
        :show-metrics="true"
        class="mb-8"
      />
    </section>

    <!-- Error Display -->
    <div v-if="error" class="mb-6">
      <UAlert
        color="red"
        variant="soft"
        :title="error"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="error = ''"
      />
    </div>

    <!-- Holdings -->
    <section class="pb-16">
      <UCard>
        <template #header>
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 class="text-xl font-bold">Current Holdings</h3>
            <UInput
              v-model="searchHoldings"
              placeholder="Search holdings..."
              icon="i-heroicons-magnifying-glass"
              class="w-full lg:w-48"
            />
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="isLoading" class="py-16">
          <div class="space-y-4">
            <USkeleton class="h-8 w-48 mx-auto" />
            <div class="space-y-3">
              <USkeleton class="h-12 w-full" v-for="i in 3" :key="i" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredHoldings.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-briefcase" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ searchHoldings ? 'No holdings found' : 'No Holdings Yet' }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ searchHoldings ? 'Try adjusting your search terms' : 'Start building your portfolio by purchasing stocks' }}
          </p>
          <UButton to="/market" icon="i-heroicons-plus">
            Browse Stocks
          </UButton>
        </div>

        <!-- Holdings Display - Responsive Layout -->
        <div v-else-if="!isLoading && filteredHoldings.length > 0">
          <!-- Mobile Card Layout (visible on mobile only) -->
          <div class="lg:hidden space-y-4 p-6">
            <div
              v-for="holding in filteredHoldings"
              :key="holding.stockSymbol"
              class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              <!-- Stock Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="holding.stockSymbol.charAt(0)"
                    size="lg"
                    class="bg-gradient-to-br from-primary-500 to-purple-600"
                  />
                  <div>
                    <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ holding.stockSymbol }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ holding.stockName }}</p>
                  </div>
                </div>
                
                <!-- P&L Badge -->
                <UBadge
                  :color="holding.profitLossPct >= 0 ? 'emerald' : 'red'"
                  variant="soft"
                  size="lg"
                >
                  <UIcon 
                    :name="holding.profitLossPct >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
                    class="w-4 h-4 mr-1"
                  />
                  {{ holding.profitLossPct >= 0 ? '+' : '' }}{{ holding.profitLossPct.toFixed(2) }}%
                </UBadge>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Shares</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ holding.quantity.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Value</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    ${{ holding.currentValue.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg. Price</p>
                  <p class="text-base text-gray-900 dark:text-white">
                    ${{ holding.averagePrice.toFixed(2) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Price</p>
                  <p class="text-base text-gray-900 dark:text-white">
                    ${{ holding.currentPrice.toFixed(2) }}
                  </p>
                </div>
              </div>

              <!-- P&L Amount -->
              <div class="mb-4 text-center">
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Profit/Loss</p>
                <p :class="[
                  'text-xl font-bold',
                  holding.profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                ]">
                  {{ holding.profitLoss >= 0 ? '+' : '' }}${{ Math.abs(holding.profitLoss).toLocaleString() }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <UButton
                  @click="buyMore(holding)"
                  color="emerald"
                  variant="outline"
                  size="lg"
                  icon="i-heroicons-plus"
                  class="flex-1"
                >
                  Buy More
                </UButton>
                <UButton
                  @click="sellStock(holding)"
                  color="red"
                  variant="outline"
                  size="lg"
                  icon="i-heroicons-minus"
                  class="flex-1"
                >
                  Sell
                </UButton>
              </div>
            </div>
          </div>

          <!-- Desktop Table Layout (hidden on mobile) -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shares</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Price</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Price</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P&L</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="holding in filteredHoldings"
                  :key="holding.stockSymbol"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-4">
                      <UAvatar
                        :text="holding.stockSymbol.charAt(0)"
                        class="bg-gradient-to-br from-primary-500 to-purple-600"
                      />
                      <div>
                        <h4 class="font-bold text-gray-900 dark:text-white">{{ holding.stockSymbol }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ holding.stockName }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="font-bold text-gray-900 dark:text-white">{{ holding.quantity.toLocaleString() }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-gray-900 dark:text-white">${{ holding.averagePrice.toFixed(2) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-gray-900 dark:text-white">${{ holding.currentPrice.toFixed(2) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="font-bold text-gray-900 dark:text-white">${{ holding.currentValue.toLocaleString() }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex flex-col items-end">
                      <span :class="[
                        'font-bold',
                        holding.profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      ]">
                        {{ holding.profitLoss >= 0 ? '+' : '' }}${{ Math.abs(holding.profitLoss).toLocaleString() }}
                      </span>
                      <UBadge
                        :color="holding.profitLossPct >= 0 ? 'emerald' : 'red'"
                        variant="soft"
                        size="sm"
                      >
                        <UIcon 
                          :name="holding.profitLossPct >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
                          class="w-3 h-3 mr-1"
                        />
                        {{ holding.profitLossPct >= 0 ? '+' : '' }}{{ holding.profitLossPct.toFixed(2) }}%
                      </UBadge>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center gap-2">
                      <UButton
                        @click="buyMore(holding)"
                        color="emerald"
                        variant="outline"
                        size="sm"
                        icon="i-heroicons-plus"
                      >
                        Buy
                      </UButton>
                      <UButton
                        @click="sellStock(holding)"
                        color="red"
                        variant="outline"
                        size="sm"
                        icon="i-heroicons-minus"
                      >
                        Sell
                      </UButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </UCard>
    </section>
  </UContainer>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'auth'
})

// SEO
useHead({
  title: 'My Portfolio - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'Track your investment portfolio performance, view holdings, and manage your stock positions with detailed analytics and insights.'
    }
  ]
})

// Composables 
const { user } = useAuth()
const { portfolio: portfolioApi, user: userApi } = useApi()

// Loading states
const isLoading = ref(true)
const isRefreshing = ref(false)
const error = ref('')

// Data
const userBalance = ref(0)
const searchHoldings = ref('')

const portfolioSummary = ref({
  totalValue: 0,
  totalCost: 0,
  totalProfit: 0,
  totalProfitPct: 0
})

const holdings = ref([])

// Load portfolio data
const loadPortfolioData = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // Load portfolio summary and holdings in parallel
    const [summaryResult, holdingsResult, profileResult] = await Promise.all([
      portfolioApi.getSummary(),
      portfolioApi.get(),
      userApi.getProfile()
    ])

    // Update portfolio summary
    if (summaryResult.data) {
      portfolioSummary.value = {
        totalValue: summaryResult.data.total_value || summaryResult.data.totalValue || 0,
        totalCost: summaryResult.data.total_cost || summaryResult.data.totalCost || 0,
        totalProfit: summaryResult.data.total_profit || summaryResult.data.totalProfit || 0,
        totalProfitPct: summaryResult.data.total_profit_pct || summaryResult.data.totalProfitPct || 0
      }
    }

    // Update holdings with better error handling
    console.log('📊 [portfolio] Holdings result:', holdingsResult)
    
    if (holdingsResult.data) {
      let portfolioData = null
      
      // Handle different possible data structures
      if (holdingsResult.data.portfolio) {
        // Check if portfolio has holdings array
        if (holdingsResult.data.portfolio.holdings && Array.isArray(holdingsResult.data.portfolio.holdings)) {
          portfolioData = holdingsResult.data.portfolio.holdings
        }
        // Check if portfolio is directly an array
        else if (Array.isArray(holdingsResult.data.portfolio)) {
          portfolioData = holdingsResult.data.portfolio
        }
        // Portfolio might be an object with array properties
        else if (holdingsResult.data.portfolio.data && Array.isArray(holdingsResult.data.portfolio.data)) {
          portfolioData = holdingsResult.data.portfolio.data
        }
      }
      // Data might be directly in the result
      else if (holdingsResult.data.holdings && Array.isArray(holdingsResult.data.holdings)) {
        portfolioData = holdingsResult.data.holdings
      }
      
      // Process portfolio data if found
      if (portfolioData && Array.isArray(portfolioData)) {
        holdings.value = portfolioData.map(item => ({
          stockSymbol: item.stock_symbol || item.stockSymbol,
          stockName: item.stock_name || item.stockName || item.symbol || 'Unknown',
          quantity: item.quantity || 0,
          averagePrice: item.average_price || item.averagePrice || 0,
          currentPrice: item.current_price || item.currentPrice || 0,
          totalCost: item.total_cost || item.totalCost || 0,
          currentValue: item.current_value || item.currentValue || 0,
          profitLoss: item.profit_loss || item.profitLoss || 0,
          profitLossPct: item.profit_loss_pct || item.profitLossPct || 0
        }))
        console.log('✅ [portfolio] Processed holdings:', holdings.value)
      } else {
        console.log('⚠️ [portfolio] No holdings found or data is not an array')
        holdings.value = []
      }
    } else {
      console.log('❌ [portfolio] No holdings data received')
      holdings.value = []
    }

    // Update user balance
    if (profileResult.data?.profile?.balance) {
      userBalance.value = profileResult.data.profile.balance
    }

  } catch (err) {
    console.error('❌ [portfolio] Failed to load portfolio data:', err)
    console.error('❌ [portfolio] Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
    error.value = `Failed to load portfolio data: ${err.message || 'Unknown error'}`
  } finally {
    isLoading.value = false
  }
}

const filteredHoldings = computed(() => {
  if (!searchHoldings.value) {
    return holdings.value
  }
  
  const query = searchHoldings.value.toLowerCase()
  return holdings.value.filter(holding => 
    holding.stockSymbol.toLowerCase().includes(query) ||
    holding.stockName.toLowerCase().includes(query)
  )
})

const refreshPortfolio = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    await loadPortfolioData()
  } finally {
    isRefreshing.value = false
  }
}

const buyMore = (holding) => {
  console.log('Buy more:', holding.stockSymbol)
  navigateTo(`/market?symbol=${holding.stockSymbol}&action=buy`)
}

const sellStock = (holding) => {
  console.log('Sell stock:', holding.stockSymbol)
  navigateTo(`/market?symbol=${holding.stockSymbol}&action=sell`)
}

// Load data on mount
onMounted(() => {
  loadPortfolioData()
})
</script>

<style scoped>
/* Component-specific styles */
</style>

