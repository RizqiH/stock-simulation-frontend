<template>
  <UContainer>
    <!-- Modern Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Transaction History
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Track your trading activity and performance
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <UButton @click="exportTransactions" variant="outline" icon="i-heroicons-arrow-down-tray">
            Export
          </UButton>
          <UButton to="/market" icon="i-heroicons-plus">
            New Trade
          </UButton>
        </div>
      </div>
    </section>

    <!-- Search and Filters -->
    <section class="py-6">
      <UCard>
        <!-- Search -->
        <div class="mb-6">
          <UInput
            v-model="searchQuery"
            placeholder="Search transactions..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
          />
        </div>
        
        <!-- Filters -->
        <div class="flex flex-wrap gap-4">
          <USelectMenu
            v-model="selectedType"
            :options="typeOptions"
            placeholder="All Types"
            class="w-40"
          />
          <USelectMenu
            v-model="selectedPeriod"
            :options="periodOptions"
            placeholder="All Time"
            class="w-40"
          />
          <USelectMenu
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="All Status"
            class="w-40"
          />
          
          <UButton @click="clearFilters" variant="outline" size="sm">
            Clear Filters
          </UButton>
        </div>
      </UCard>
    </section>

    <!-- Error Alert -->
    <UAlert
      v-if="error"
      color="red"
      variant="solid"
      :title="error"
      :actions="[{ variant: 'outline', color: 'white', label: 'Retry', click: loadTransactions }]"
      class="mb-6"
    />

    <!-- Transaction Stats -->
    <section class="py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Loading Stats -->
        <template v-if="isLoadingStats">
          <div v-for="i in 4" :key="i">
            <UCard class="p-6 text-center">
              <USkeleton class="h-12 w-12 rounded-full mx-auto mb-3" />
              <USkeleton class="h-4 w-20 mx-auto mb-2" />
              <USkeleton class="h-6 w-16 mx-auto mb-2" />
              <USkeleton class="h-3 w-24 mx-auto" />
            </UCard>
          </div>
        </template>
        
        <!-- Actual Stats -->
        <template v-else>
          <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-emerald-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Trades</h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ stats.totalTrades }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">All time</p>
          </UCard>
          
          <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Volume</h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${{ stats.totalVolume.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">Trading volume</p>
          </UCard>
          
          <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300',
              stats.profitLoss >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'
            ]">
              <UIcon
                :name="stats.profitLoss >= 0 ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'"
                :class="[
                  'w-6 h-6',
                  stats.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
                ]"
              />
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">P&L</h3>
            <p :class="[
              'text-2xl font-bold mb-2',
              stats.profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.profitLoss >= 0 ? '+' : '' }}${{ Math.abs(stats.profitLoss).toLocaleString() }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500">Realized P&L</p>
          </UCard>
          
          <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
            <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-star" class="w-6 h-6 text-amber-600" />
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Success Rate</h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ stats.successRate }}%</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">Profitable trades</p>
          </UCard>
        </template>
      </div>
    </section>

    <!-- Transactions Table -->
    <section class="pb-16">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">
              Transactions ({{ filteredTransactions.length }})
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
            </div>
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
        <div v-else-if="filteredTransactions.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No transactions found</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ searchQuery || selectedType || selectedPeriod || selectedStatus ? 'Try adjusting your filters' : 'Start trading to see your transaction history' }}
          </p>
          <UButton to="/market" variant="outline">
            Start Trading
          </UButton>
        </div>

        <!-- Desktop Table -->
        <div v-else class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="transaction in paginatedTransactions"
                :key="transaction.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <UAvatar
                      :text="(transaction.stock_symbol || 'S').charAt(0)"
                      size="sm"
                      class="bg-gradient-to-br from-primary-500 to-purple-600 mr-3"
                    />
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ transaction.stock_symbol || 'Unknown' }}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ transaction.stock_name || 'Stock' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <UBadge
                    :color="transaction.type === 'BUY' ? 'emerald' : 'red'"
                    variant="soft"
                  >
                    {{ transaction.type || 'N/A' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="font-semibold text-gray-900 dark:text-white">{{ transaction.quantity || 0 }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="font-semibold text-gray-900 dark:text-white">${{ (transaction.price || 0).toFixed(2) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="font-bold text-gray-900 dark:text-white">${{ (transaction.total_amount || 0).toLocaleString() }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(transaction.created_at) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <UBadge
                    color="emerald"
                    variant="soft"
                  >
                    Completed
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <UDropdown :items="getActionItems(transaction)">
                    <UButton variant="ghost" size="sm" icon="i-heroicons-ellipsis-horizontal" />
                  </UDropdown>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="lg:hidden space-y-4">
          <UCard
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            class="p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center">
                <UAvatar
                  :text="(transaction.stock_symbol || 'S').charAt(0)"
                  size="sm"
                  class="bg-gradient-to-br from-primary-500 to-purple-600 mr-3"
                />
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">{{ transaction.stock_symbol || 'Unknown' }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ transaction.stock_name || 'Stock' }}</p>
                </div>
              </div>
              <UBadge
                :color="transaction.type === 'BUY' ? 'emerald' : 'red'"
                variant="soft"
              >
                {{ transaction.type || 'N/A' }}
              </UBadge>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Quantity</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ transaction.quantity || 0 }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Price</p>
                <p class="font-semibold text-gray-900 dark:text-white">${{ (transaction.price || 0).toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p class="font-bold text-gray-900 dark:text-white">${{ (transaction.total_amount || 0).toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Date</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(transaction.created_at) }}</p>
              </div>
            </div>
            
            <div class="mt-4 flex justify-between items-center">
              <UBadge color="emerald" variant="soft">Completed</UBadge>
              <UDropdown :items="getActionItems(transaction)">
                <UButton variant="ghost" size="sm" icon="i-heroicons-ellipsis-horizontal" />
              </UDropdown>
            </div>
          </UCard>
        </div>

        <!-- Pagination -->
        <template #footer>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of {{ filteredTransactions.length }} transactions
            </p>
            <UPagination
              v-model="currentPage"
              :page-count="itemsPerPage"
              :total="filteredTransactions.length"
            />
          </div>
        </template>
      </UCard>
    </section>
  </UContainer>
</template>

<script setup>
// SEO
useHead({
  title: 'Transaction History - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'View your complete trading history, analyze performance, and track all your stock transactions.'
    }
  ]
})

// Middleware
definePageMeta({
  middleware: 'auth'
})

// Composables
const { transactions } = useApi()
const { success, error: notifyError } = useNotifications()

// Reactive data
const allTransactions = ref([])
const isLoading = ref(true)
const isLoadingStats = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedType = ref('')
const selectedPeriod = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Mock stats (would come from API)
const stats = ref({
  totalTrades: 0,
  totalVolume: 0,
  profitLoss: 0,
  successRate: 0
})

// Filter options
const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Buy', value: 'BUY' },
  { label: 'Sell', value: 'SELL' }
]

const periodOptions = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' }
]

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' }
]

// Computed properties
const filteredTransactions = computed(() => {
  let filtered = allTransactions.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(transaction => 
      (transaction.stock_symbol || '').toLowerCase().includes(query) ||
      (transaction.stock_name || '').toLowerCase().includes(query)
    )
  }

  // Type filter
  if (selectedType.value) {
    filtered = filtered.filter(transaction => transaction.type === selectedType.value.toUpperCase())
  }

  // Status filter (all transactions are completed for now)
  if (selectedStatus.value && selectedStatus.value !== 'completed') {
    filtered = []
  }

  // Period filter
  if (selectedPeriod.value) {
    const now = new Date()
    const period = selectedPeriod.value
    
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.created_at)
      
      switch (period) {
        case 'today':
          return transactionDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case 'month':
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear()
        case 'year':
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransactions.value.slice(start, end)
})

// Watch for filter changes
watch([searchQuery, selectedType, selectedPeriod, selectedStatus], () => {
  currentPage.value = 1
})

// Methods
const loadTransactions = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const result = await transactions.getTransactions()
    if (result.data?.transactions) {
      allTransactions.value = result.data.transactions
      calculateStats()
    } else {
      allTransactions.value = []
    }
  } catch (err) {
    error.value = err.message || 'Failed to load transactions'
    console.error('Failed to load transactions:', err)
  } finally {
    isLoading.value = false
    isLoadingStats.value = false
  }
}

const calculateStats = () => {
  const transactions = allTransactions.value
  
  // Calculate real P&L based on actual transactions
  let totalBuyAmount = 0
  let totalSellAmount = 0
  let profitableTrades = 0
  let totalTrades = 0
  
  // Group transactions by stock symbol to calculate P&L
  const stockPositions = new Map()
  
  transactions.forEach(transaction => {
    const symbol = transaction.stock_symbol
    const type = transaction.type?.toUpperCase()
    const quantity = transaction.quantity || 0
    const price = transaction.price || 0
    const amount = transaction.total_amount || 0
    
    if (!stockPositions.has(symbol)) {
      stockPositions.set(symbol, {
        totalBought: 0,
        totalSold: 0,
        avgBuyPrice: 0,
        avgSellPrice: 0,
        buyTransactions: 0,
        sellTransactions: 0
      })
    }
    
    const position = stockPositions.get(symbol)
    
    if (type === 'BUY') {
      totalBuyAmount += amount
      position.totalBought += quantity
      position.avgBuyPrice = ((position.avgBuyPrice * position.buyTransactions) + price) / (position.buyTransactions + 1)
      position.buyTransactions++
    } else if (type === 'SELL') {
      totalSellAmount += amount
      position.totalSold += quantity
      position.avgSellPrice = ((position.avgSellPrice * position.sellTransactions) + price) / (position.sellTransactions + 1)
      position.sellTransactions++
      
      // Check if this sell was profitable
      if (price > position.avgBuyPrice && position.avgBuyPrice > 0) {
        profitableTrades++
      }
      totalTrades++
    }
  })
  
  // Calculate overall P&L
  const realizedProfitLoss = totalSellAmount - totalBuyAmount
  const successRate = totalTrades > 0 ? Math.round((profitableTrades / totalTrades) * 100) : 0
  
  stats.value = {
    totalTrades: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
    profitLoss: realizedProfitLoss, // Real calculation from actual trades
    successRate: successRate // Real calculation based on profitable sells
  }
  
  console.log('📊 [Transactions] Real stats calculated:', {
    totalTrades: transactions.length,
    totalBuyAmount,
    totalSellAmount,
    realizedProfitLoss,
    profitableTrades,
    successRate: `${successRate}%`
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedPeriod.value = ''
  selectedStatus.value = ''
}

const exportTransactions = async () => {
  try {
    // Mock export functionality
    const data = {
      transactions: filteredTransactions.value,
      filters: {
        search: searchQuery.value,
        type: selectedType.value,
        period: selectedPeriod.value,
        status: selectedStatus.value
      },
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    success('Export Successful', 'Your transaction data has been exported')
  } catch (err) {
    notifyError('Export Failed', 'Could not export transaction data')
  }
}

const getActionItems = (transaction) => {
  return [[
    {
      label: 'View Details',
      icon: 'i-heroicons-eye',
      click: () => viewDetails(transaction)
    },
    {
      label: 'Download Receipt',
      icon: 'i-heroicons-document-arrow-down',
      click: () => downloadReceipt(transaction)
    }
  ]]
}

const viewDetails = (transaction) => {
  // Navigate to stock details or show modal
  navigateTo(`/stock/${transaction.stock_symbol}`)
}

const downloadReceipt = async (transaction) => {
  try {
    // Mock receipt download
    const receipt = `
STOCKSIM PRO - TRANSACTION RECEIPT
================================
Transaction ID: ${transaction.id}
Date: ${formatDate(transaction.created_at)}
Stock: ${transaction.stock_symbol}
Type: ${transaction.type?.toUpperCase()}
Quantity: ${transaction.quantity}
Price: $${transaction.price?.toFixed(2)}
Total: $${transaction.total_amount?.toLocaleString()}
Status: Completed
    `
    
    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${transaction.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    success('Receipt Downloaded', 'Transaction receipt has been downloaded')
  } catch (err) {
    notifyError('Download Failed', 'Could not download receipt')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Load data on mount
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
/* Component-specific styles */
</style> 