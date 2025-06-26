<template>
  <UContainer>
    <!-- Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Price Simulator
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Control automatic stock price movements
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Simulator Status -->
    <section class="py-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">Simulator Status</h2>
            <UButton @click="refreshStatus" variant="outline" size="sm" icon="i-heroicons-arrow-path">
              Refresh
            </UButton>
          </div>
        </template>

        <div v-if="loading" class="text-center py-8">
          <USkeleton class="h-4 w-48 mx-auto mb-4" />
          <USkeleton class="h-4 w-32 mx-auto" />
        </div>

        <div v-else class="space-y-6">
          <!-- Status Display -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-2xl mb-2">
                {{ status?.running ? '🟢' : '🔴' }}
              </div>
              <h3 class="font-semibold">Status</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ status?.running ? 'Running' : 'Stopped' }}
              </p>
            </div>

            <div class="text-center">
              <div class="text-2xl mb-2">⏱️</div>
              <h3 class="font-semibold">Update Interval</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ status?.update_interval || 'N/A' }}
              </p>
            </div>

            <div class="text-center">
              <div class="text-2xl mb-2">📈</div>
              <h3 class="font-semibold">Volatility</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ status?.volatility ? `${status.volatility}%` : 'N/A' }}
              </p>
            </div>

            <div class="text-center">
              <div class="text-2xl mb-2">🎯</div>
              <h3 class="font-semibold">Max Change</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ status?.max_change ? `${status.max_change}%` : 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex flex-wrap gap-4 pt-6 border-t">
            <UButton 
              @click="startSimulator"
              :disabled="status?.running || actionLoading"
              :loading="actionLoading === 'start'"
              color="green"
              icon="i-heroicons-play"
            >
              Start Simulator
            </UButton>

            <UButton 
              @click="stopSimulator"
              :disabled="!status?.running || actionLoading"
              :loading="actionLoading === 'stop'"
              color="red"
              icon="i-heroicons-stop"
            >
              Stop Simulator
            </UButton>

            <UButton 
              @click="manualUpdate"
              :disabled="actionLoading"
              :loading="actionLoading === 'manual'"
              variant="outline"
              icon="i-heroicons-arrow-path"
            >
              Manual Update
            </UButton>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Current Stock Prices -->
    <section class="py-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">Current Stock Prices</h2>
            <UButton @click="loadStocks" variant="outline" size="sm" icon="i-heroicons-arrow-path">
              Refresh Prices
            </UButton>
          </div>
        </template>

        <div v-if="stocksLoading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between p-4 border rounded">
            <div class="flex items-center gap-3">
              <USkeleton class="h-10 w-10 rounded-full" />
              <div>
                <USkeleton class="h-4 w-16 mb-2" />
                <USkeleton class="h-3 w-24" />
              </div>
            </div>
            <USkeleton class="h-6 w-20" />
          </div>
        </div>

        <div v-else-if="stocks.length === 0" class="text-center py-8">
          <div class="text-4xl mb-4">📊</div>
          <p class="text-gray-600 dark:text-gray-400">No stocks found</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="stock in stocks" 
            :key="stock.symbol"
            class="flex items-center justify-between p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <UAvatar
                :text="stock.symbol.charAt(0)"
                size="sm"
                class="bg-gradient-to-br from-primary-500 to-purple-600"
              />
              <div>
                <h4 class="font-semibold">{{ stock.symbol }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ stock.name }}</p>
              </div>
            </div>
            
            <div class="text-right">
              <p class="font-bold text-lg">${{ stock.current_price?.toFixed(2) }}</p>
              <p class="text-xs text-gray-500">
                Updated: {{ formatTime(stock.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Instructions -->
    <section class="py-6">
      <UCard>
        <template #header>
          <h2 class="text-xl font-bold">How It Works</h2>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl mb-3">🤖</div>
              <h3 class="font-semibold mb-2">Automatic Updates</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Stock prices update automatically every 5 seconds with realistic market movements
              </p>
            </div>

            <div class="text-center">
              <div class="text-3xl mb-3">📊</div>
              <h3 class="font-semibold mb-2">Realistic Volatility</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Price movements simulate real market conditions with trend influences
              </p>
            </div>

            <div class="text-center">
              <div class="text-3xl mb-3">⚡</div>
              <h3 class="font-semibold mb-2">Limit Order Testing</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Perfect for testing limit orders that trigger when price conditions are met
              </p>
            </div>
          </div>

          <UAlert 
            color="blue"
            variant="soft"
            title="Pro Tip"
            description="Create limit orders in Advanced Orders page, then watch them execute automatically as prices change!"
          />
        </div>
      </UCard>
    </section>
  </UContainer>
</template>

<script setup>
// SEO
useHead({
  title: 'Price Simulator - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'Control automatic stock price movements and test trading strategies.'
    }
  ]
})

// Middleware
definePageMeta({
  middleware: 'auth'
})

// Composables
const { apiCall } = useApi()
const { success, error: notifyError } = useNotifications()

// Reactive data
const loading = ref(true)
const actionLoading = ref('')
const stocksLoading = ref(false)
const status = ref(null)
const stocks = ref([])

// Methods
const refreshStatus = async () => {
  try {
    loading.value = true
    const response = await apiCall('/simulator/status', 'GET')
    
    if (response.error) {
      throw new Error(response.error)
    }

    status.value = response.data.simulator
  } catch (err) {
    notifyError('Failed to get simulator status', err.message)
  } finally {
    loading.value = false
  }
}

const startSimulator = async () => {
  try {
    actionLoading.value = 'start'
    const response = await apiCall('/simulator/start', 'POST')
    
    if (response.error) {
      throw new Error(response.error)
    }

    success('Price Simulator Started', 'Stock prices will now update automatically every 5 seconds')
    await refreshStatus()
  } catch (err) {
    notifyError('Failed to start simulator', err.message)
  } finally {
    actionLoading.value = ''
  }
}

const stopSimulator = async () => {
  try {
    actionLoading.value = 'stop'
    const response = await apiCall('/simulator/stop', 'POST')
    
    if (response.error) {
      throw new Error(response.error)
    }

    success('Price Simulator Stopped', 'Automatic price updates have been halted')
    await refreshStatus()
  } catch (err) {
    notifyError('Failed to stop simulator', err.message)
  } finally {
    actionLoading.value = ''
  }
}

const manualUpdate = async () => {
  try {
    actionLoading.value = 'manual'
    const response = await apiCall('/stocks/simulate', 'POST')
    
    if (response.error) {
      throw new Error(response.error)
    }

    success('Manual Update Complete', 'All stock prices have been updated')
    await loadStocks()
  } catch (err) {
    notifyError('Failed to update prices', err.message)
  } finally {
    actionLoading.value = ''
  }
}

const loadStocks = async () => {
  try {
    stocksLoading.value = true
    const { stocks: stocksComposable } = useApi()
    const response = await stocksComposable.getAll()
    
    if (response.error) {
      throw new Error(response.error)
    }

    stocks.value = response.data?.stocks || []
  } catch (err) {
    notifyError('Failed to load stocks', err.message)
  } finally {
    stocksLoading.value = false
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'Unknown'
  try {
    return new Date(timestamp).toLocaleTimeString()
  } catch {
    return 'Unknown'
  }
}

// Auto-refresh status and stocks
const autoRefresh = () => {
  setInterval(() => {
    if (!loading.value && !actionLoading.value) {
      refreshStatus()
    }
    if (!stocksLoading.value) {
      loadStocks()
    }
  }, 10000) // Refresh every 10 seconds
}

// Load initial data
onMounted(async () => {
  await Promise.all([
    refreshStatus(),
    loadStocks()
  ])
  
  // Start auto-refresh
  autoRefresh()
})
</script>

<style scoped>
/* Add any custom styles if needed */
</style> 