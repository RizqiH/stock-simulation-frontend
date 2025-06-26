<template>
  <UContainer>
    <!-- Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-heart" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              My Watchlist
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Track your favorite stocks and market movements
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <UButton
            @click="updateWatchlistPrices"
            :loading="isLoading"
            variant="outline"
            icon="i-heroicons-arrow-path"
          >
            {{ isLoading ? 'Updating...' : 'Refresh Prices' }}
          </UButton>
          <UButton
            @click="showAddModal = true"
            icon="i-heroicons-plus"
          >
            Add Stock
          </UButton>
        </div>
      </div>
    </section>

    <!-- Watchlist Summary -->
    <section class="py-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard class="p-6 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ watchlistSummary.total }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Stocks</p>
        </UCard>
        
        <UCard class="p-6 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{{ watchlistSummary.gainers }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Gainers</p>
        </UCard>
        
        <UCard class="p-6 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-arrow-trending-down" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{{ watchlistSummary.losers }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Losers</p>
        </UCard>
        
        <UCard class="p-6 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-minus" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">{{ watchlistSummary.unchanged }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Unchanged</p>
        </UCard>
      </div>
    </section>

    <!-- Watchlist Table -->
    <section class="pb-16">
      <UCard>
        <template #header>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 class="text-xl font-bold">
              Watchlist ({{ watchlist.length }})
            </h2>
            <UButton
              v-if="watchlist.length > 0"
              @click="clearWatchlist"
              color="red"
              variant="outline"
              size="sm"
              class="self-start sm:self-center"
            >
              Clear All
            </UButton>
          </div>
        </template>

        <!-- Empty State -->
        <div v-if="watchlist.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-heart" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your watchlist is empty</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Add stocks to your watchlist to track their performance
          </p>
          <UButton @click="showAddModal = true">
            Add Your First Stock
          </UButton>
        </div>

        <!-- Watchlist Display - Responsive Layout -->
        <div v-else>
          <!-- Mobile Card Layout (visible on mobile only) -->
          <div class="lg:hidden space-y-4 p-6">
            <div
              v-for="item in watchlist"
              :key="item.symbol"
              class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              <!-- Stock Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="item.symbol.charAt(0)"
                    size="lg"
                    class="bg-gradient-to-br from-primary-500 to-purple-600"
                  />
                  <div>
                    <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ item.symbol }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.name }}</p>
                  </div>
                </div>
                
                <!-- Price Badge -->
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    ${{ item.current_price.toFixed(2) }}
                  </p>
                  <UBadge
                    :color="item.change >= 0 ? 'emerald' : 'red'"
                    variant="soft"
                    size="lg"
                  >
                    {{ item.change >= 0 ? '+' : '' }}{{ item.change_pct.toFixed(2) }}%
                  </UBadge>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Price Change</p>
                  <p :class="[
                    'text-lg font-bold',
                    item.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  ]">
                    {{ item.change >= 0 ? '+' : '' }}${{ Math.abs(item.change).toFixed(2) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Added On</p>
                  <p class="text-base text-gray-900 dark:text-white">
                    {{ formatDate(item.added_at) }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <UButton
                  :to="`/stock/${item.symbol}`"
                  variant="outline"
                  size="lg"
                  icon="i-heroicons-eye"
                  class="flex-1"
                >
                  View Details
                </UButton>
                <UButton
                  @click="removeFromWatchlist(item.symbol)"
                  color="red"
                  variant="outline"
                  size="lg"
                  icon="i-heroicons-x-mark"
                  class="flex-1"
                >
                  Remove
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
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="item in watchlist"
                  :key="item.symbol"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :text="item.symbol.charAt(0)"
                        size="sm"
                        class="bg-gradient-to-br from-primary-500 to-purple-600"
                      />
                      <div>
                        <div class="font-bold text-gray-900 dark:text-white">{{ item.symbol }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">{{ item.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="font-bold text-gray-900 dark:text-white">${{ item.current_price.toFixed(2) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex flex-col items-end">
                      <span :class="[
                        'font-semibold',
                        item.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                      ]">
                        {{ item.change >= 0 ? '+' : '' }}${{ Math.abs(item.change).toFixed(2) }}
                      </span>
                      <UBadge
                        :color="item.change >= 0 ? 'emerald' : 'red'"
                        variant="soft"
                        size="sm"
                      >
                        {{ item.change >= 0 ? '+' : '' }}{{ item.change_pct.toFixed(2) }}%
                      </UBadge>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ formatDate(item.added_at) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center gap-2">
                      <UButton
                        :to="`/stock/${item.symbol}`"
                        variant="ghost"
                        size="sm"
                        icon="i-heroicons-eye"
                      />
                      <UButton
                        @click="removeFromWatchlist(item.symbol)"
                        color="red"
                        variant="ghost"
                        size="sm"
                        icon="i-heroicons-x-mark"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Add Stock Modal -->
    <UModal v-model="showAddModal">
      <UCard>
        <template #header>
          <h3 class="text-xl font-bold">Add Stock to Watchlist</h3>
        </template>
        
        <div class="space-y-4">
          <UFormGroup label="Stock Symbol" required>
            <UInput
              v-model="newStockSymbol"
              placeholder="Enter stock symbol (e.g., AAPL)"
              :loading="isLoading"
              @keyup.enter="addStock"
            />
          </UFormGroup>
          
          <div class="flex gap-3">
            <UButton
              @click="addStock"
              :loading="isLoading"
              :disabled="!newStockSymbol"
              class="flex-1"
            >
              Add to Watchlist
            </UButton>
            <UButton
              @click="showAddModal = false"
              variant="outline"
              :disabled="isLoading"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup>
// SEO
useHead({
  title: 'My Watchlist - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'Track your favorite stocks and monitor market movements with your personal watchlist.'
    }
  ]
})

// Composables
const {
  watchlist,
  isLoading,
  watchlistSummary,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistPrices,
  clearWatchlist
} = useWatchlist()

// Reactive data
const showAddModal = ref(false)
const newStockSymbol = ref('')

// Methods
const addStock = async () => {
  if (!newStockSymbol.value) return
  
  const success = await addToWatchlist(newStockSymbol.value.toUpperCase())
  if (success) {
    newStockSymbol.value = ''
    showAddModal.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Auto-refresh watchlist prices every 5 minutes
const { start } = useRealTime(updateWatchlistPrices, {
  interval: 300000, // 5 minutes
  enabled: computed(() => watchlist.value.length > 0)
})

onMounted(() => {
  start()
})
</script>

<style scoped>
/* Component-specific styles */
</style> 