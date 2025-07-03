<template>
  <div class="bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900 min-h-screen">
    <!-- Welcome Header -->
    <section class="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <UContainer class="py-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-600 via-purple-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {{ displayName }}!
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                  Ready to make some smart trades today?
                </p>
              </div>
            </div>
          </div>
          
          <!-- Portfolio Value Card -->
          <ClientOnly>
            <UCard class="p-6" v-if="isDataLoaded">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 text-white" />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Portfolio Value</p>
                  <p class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    ${{ portfolioData?.total_value?.toLocaleString() || '0' }}
                  </p>
                  <UBadge
                    :color="(portfolioData?.total_profit || 0) >= 0 ? 'emerald' : 'red'"
                    variant="soft"
                    size="sm"
                  >
                    <UIcon 
                      :name="(portfolioData?.total_profit || 0) >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                      class="w-3 h-3 mr-1"
                    />
                    {{ (portfolioData?.total_profit || 0) >= 0 ? '+' : '' }}{{ (portfolioData?.total_profit_pct || 0).toFixed(2) }}%
                  </UBadge>
                </div>
              </div>
            </UCard>
            <template #fallback>
              <UCard class="p-6">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  <div class="space-y-2">
                    <div class="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </UCard>
            </template>
          </ClientOnly>
        </div>
      </UContainer>
    </section>

    <!-- Main Dashboard Content -->
    <section class="py-8">
      <UContainer>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content Area -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Portfolio Overview Stats -->
            <UCard class="p-8">
              <div class="flex items-center justify-between mb-8">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Overview</h3>
                <ClientOnly>
                  <UButton
                    @click="refreshData"
                    :disabled="isRefreshing"
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-arrow-path"
                    :loading="isRefreshing"
                  >
                    {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
                  </UButton>
                </ClientOnly>
              </div>
              
              <ClientOnly>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8" v-if="isDataLoaded">
                  <!-- Total Value -->
                  <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Total Value</h4>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      ${{ portfolioData?.total_value?.toLocaleString() || '0' }}
                    </p>
                    <UBadge :color="(portfolioData?.total_profit || 0) >= 0 ? 'emerald' : 'red'" variant="soft">
                      {{ (portfolioData?.total_profit || 0) >= 0 ? '+' : '' }}${{ Math.abs(portfolioData?.total_profit || 0).toLocaleString() }}
                    </UBadge>
                  </div>
                  
                  <!-- Available Cash -->
                  <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Available Cash</h4>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      ${{ userProfile?.balance?.toLocaleString() || '0' }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ (((userProfile?.balance || 0) / (portfolioData?.total_value || 1)) * 100).toFixed(1) }}% of portfolio
                    </p>
                  </div>
                  
                  <!-- Total Profit -->
                  <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <UIcon name="i-heroicons-arrow-trending-up" class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Total Profit</h4>
                    <p :class="[
                      'text-3xl font-bold mb-2',
                      (userProfile?.total_profit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    ]">
                      {{ (userProfile?.total_profit || 0) >= 0 ? '+' : '' }}${{ Math.abs(userProfile?.total_profit || 0).toLocaleString() }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      All-time performance
                    </p>
                  </div>
                </div>
                <template #fallback>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div v-for="i in 3" :key="i" class="text-center">
                      <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto mb-4 animate-pulse"></div>
                      <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
                      <div class="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
                      <div class="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </UCard>

            <!-- Portfolio Holdings -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Your Holdings</h3>
                  <UButton to="/portfolio" variant="outline" size="sm">
                    View All
                  </UButton>
                </div>
              </template>
              
              <div class="p-6">
                <ClientOnly>
                  <!-- Empty State -->
                  <div v-if="isDataLoaded && (!portfolioData?.holdings || portfolioData.holdings.length === 0)" class="text-center py-12">
                    <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <UIcon name="i-heroicons-briefcase" class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No holdings yet</h4>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                      Start building your portfolio by purchasing stocks
                    </p>
                    <UButton to="/market">
                      Start Trading
                    </UButton>
                  </div>
                  
                  <!-- Holdings List -->
                  <div v-else-if="isDataLoaded && portfolioData?.holdings" class="space-y-3">
                    <div
                      v-for="holding in portfolioData.holdings.slice(0, 5)"
                      :key="holding.stock_symbol"
                      class="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span class="text-white font-bold">{{ holding.stock_symbol.charAt(0) }}</span>
                        </div>
                        <div>
                          <h4 class="font-bold text-gray-900 dark:text-white">{{ holding.stock_symbol }}</h4>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ holding.quantity }} shares</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="font-bold text-gray-900 dark:text-white">${{ holding.current_value?.toLocaleString() || '0' }}</p>
                        <UBadge
                          :color="(holding.profit_loss || 0) >= 0 ? 'emerald' : 'red'"
                          variant="soft"
                          size="sm"
                        >
                          {{ (holding.profit_loss || 0) >= 0 ? '+' : '' }}{{ (holding.profit_loss_pct || 0).toFixed(2) }}%
                        </UBadge>
                      </div>
                    </div>
                  </div>
                  
                  <template #fallback>
                    <div class="space-y-4">
                      <div v-for="i in 3" :key="i" class="flex items-center justify-between p-3 rounded-lg">
                        <div class="flex items-center gap-3">
                          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                          <div class="space-y-2">
                            <div class="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div class="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div class="text-right space-y-2">
                          <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div class="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </UCard>
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Quick Actions -->
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
              </template>
              <div class="p-6 space-y-3">
                <UButton to="/market" variant="outline" block icon="i-heroicons-magnifying-glass">
                  Browse Stocks
                </UButton>
                <UButton to="/portfolio" variant="outline" block icon="i-heroicons-briefcase">
                  View Portfolio
                </UButton>
                <UButton to="/transactions" variant="outline" block icon="i-heroicons-document-text">
                  Transaction History
                </UButton>
                <UButton to="/leaderboard" variant="outline" block icon="i-heroicons-trophy">
                  Leaderboard
                </UButton>
              </div>
            </UCard>

            <!-- User Ranking -->
            <ClientOnly>
              <UCard v-if="isDataLoaded && userProfile?.rank">
                <template #header>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Your Ranking</h3>
                </template>
                <div class="p-8 text-center">
                  <div class="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl font-bold text-white">#{{ userProfile.rank }}</span>
                  </div>
                  <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Rank {{ userProfile.rank }}</h4>
                  <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Global ranking among all traders
                  </p>
                  <UButton to="/leaderboard" block>
                    View Full Leaderboard
                  </UButton>
                </div>
              </UCard>
            </ClientOnly>
            
            <!-- Trading Tips -->
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Trading Tips</h3>
              </template>
              <div class="p-6 space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Diversify Your Portfolio</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Don't put all your virtual money in one stock. Spread risk across different sectors.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Research Before Buying</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Study company fundamentals and market trends before making investment decisions.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Be Patient</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Good investments take time. Don't panic sell during short-term market fluctuations.</p>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'auth'
})

// SEO
useHead({
  title: 'Dashboard - StockSim Pro',
  meta: [
    { name: 'description', content: 'Your StockSim Pro dashboard - track your portfolio performance, view market data, and manage your virtual trading account.' }
  ]
})

// Composables
const { user, refreshProfile } = useAuth()
const { portfolio: portfolioApi } = useApi()

// SSR-safe data fetching using useAsyncData
const { data: portfolioData, pending: portfolioPending, refresh: refreshPortfolio } = await useAsyncData(
  'dashboard-portfolio',
  () => portfolioApi.getSummary(),
  {
    transform: (result) => result.data || null,
    default: () => ({
      total_value: 0,
      total_profit: 0,
      total_profit_pct: 0,
      holdings: []
    })
  }
)

const { data: userProfile, pending: userPending, refresh: refreshUser } = await useAsyncData(
  'dashboard-user',
  async () => {
    await refreshProfile()
    return user.value
  },
  {
    default: () => ({
      username: 'Trader',
      balance: 0,
      total_profit: 0,
      rank: null
    })
  }
)

// Reactive state
const isRefreshing = ref(false)

// Computed values - SSR safe
const displayName = computed(() => userProfile.value?.username || 'Trader')
const isDataLoaded = computed(() => !portfolioPending.value && !userPending.value)

// Methods
const refreshData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      refreshPortfolio(),
      refreshUser()
    ])
  } finally {
    isRefreshing.value = false
  }
}
</script>

