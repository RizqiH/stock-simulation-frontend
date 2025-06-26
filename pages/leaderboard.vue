<template>
  <UContainer>
    <!-- Modern Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-trophy" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              See how you rank against other traders
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <USelectMenu
            v-model="selectedPeriod"
            :options="periodOptions"
            class="w-40"
          />
          <UButton
            @click="refreshLeaderboard"
            :loading="isRefreshing"
            variant="outline"
            icon="i-heroicons-arrow-path"
            :disabled="isRefreshing"
          >
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Current User Stats -->
    <section class="py-6">
      <UCard class="p-8 border-primary-200 dark:border-primary-700/30 hover:shadow-xl transition-all duration-300">
        <div class="flex flex-col lg:flex-row lg:items-center gap-8">
          <div class="flex items-center gap-6">
            <div class="relative">
              <UAvatar
                :text="currentUser.name.charAt(0)"
                size="xl"
                class="bg-gradient-to-br from-primary-500 to-purple-600 ring-4 ring-primary-200 dark:ring-primary-700/30"
              />
              <UBadge
                :label="'#' + currentUser.rank"
                color="amber"
                variant="solid"
                class="absolute -bottom-2 -right-2"
              />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentUser.name }}</h3>
              <p class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-4 h-4" />
                Your Current Ranking
              </p>
            </div>
          </div>
          
          <div class="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center lg:text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Portfolio Value</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">${{ currentUser.portfolioValue.toLocaleString() }}</p>
            </div>
            <div class="text-center lg:text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Return</p>
              <div class="flex items-center justify-center lg:justify-start gap-1">
                <p class="text-2xl font-bold" :class="currentUser.totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                  {{ currentUser.totalReturn >= 0 ? '+' : '' }}{{ currentUser.totalReturn.toFixed(2) }}%
                </p>
                <UIcon 
                  :name="currentUser.totalReturn >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
                  class="w-5 h-5"
                  :class="currentUser.totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
                />
              </div>
            </div>
            <div class="text-center lg:text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Trades</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentUser.totalTrades }}</p>
            </div>
            <div class="text-center lg:text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
              <div class="flex items-center justify-center lg:justify-start gap-2">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentUser.winRate }}%</p>
                <UBadge
                  :color="currentUser.streak > 0 ? 'emerald' : currentUser.streak < 0 ? 'red' : 'gray'"
                  variant="soft"
                  :label="(currentUser.streak > 0 ? '+' : '') + currentUser.streak"
                />
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Top Performers -->
    <section class="py-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Performers</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Top 3 Podium -->
        <UCard
          v-for="(topUser, index) in topThree"
          :key="topUser.id"
          :class="getPodiumCardClass(index)"
          class="text-center relative overflow-hidden hover:scale-105 transition-all duration-300"
        >
          <!-- Crown for #1 -->
          <div v-if="index === 0" class="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <UIcon name="i-heroicons-star" class="w-8 h-8 text-amber-500" />
          </div>
          
          <div class="p-6">
            <!-- Rank Badge -->
            <div class="mb-4">
              <UBadge
                :color="getPodiumBadgeColor(index)"
                variant="solid"
                size="lg"
                :label="(index + 1).toString()"
                class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              />
            </div>
            
            <!-- User Info -->
            <UAvatar
              :text="topUser.name.charAt(0)"
              size="lg"
              class="bg-gradient-to-br from-gray-600 to-gray-800 mx-auto mb-3"
            />
            <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ topUser.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ topUser.title }}</p>
            
            <!-- Stats -->
            <div class="space-y-2">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                <p class="font-bold text-gray-900 dark:text-white">${{ topUser.portfolioValue.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Return</p>
                <p class="font-bold" :class="topUser.totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                  {{ topUser.totalReturn >= 0 ? '+' : '' }}{{ topUser.totalReturn.toFixed(2) }}%
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <!-- Full Leaderboard -->
    <section class="pb-16">
      <UCard>
        <template #header>
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 class="text-xl font-bold">Full Rankings</h3>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <UInput
                v-model="searchQuery"
                placeholder="Search traders..."
                icon="i-heroicons-magnifying-glass"
                class="w-full sm:w-48"
              />
              <USelectMenu
                v-model="selectedCategory"
                :options="categoryOptions"
                class="w-full sm:w-40"
              />
            </div>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4 p-6">
          <div v-for="i in 10" :key="i" class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            <div class="flex items-center gap-4">
              <USkeleton class="h-12 w-12 rounded-xl" />
              <div class="space-y-2">
                <USkeleton class="h-4 w-24" />
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
        <div v-else-if="filteredUsers.length === 0" class="text-center py-16">
          <div class="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-trophy" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No traders found</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'No traders available' }}
          </p>
          <UButton @click="refreshLeaderboard" variant="outline">
            Refresh Data
          </UButton>
        </div>

        <!-- Leaderboard Display - Responsive Layout -->
        <div v-else>
          <!-- Mobile Card Layout (visible on mobile only) -->
          <div class="lg:hidden space-y-4 p-6">
            <div
              v-for="userItem in paginatedUsers"
              :key="userItem.id"
              :class="{
                'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20': userItem.id === currentUser.id
              }"
              class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              <!-- User Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <UAvatar
                      :text="userItem.name.charAt(0)"
                      size="lg"
                      class="bg-gradient-to-br from-gray-600 to-gray-800"
                    />
                    <UBadge
                      :color="getRankBadgeColor(userItem.rank)"
                      variant="solid"
                      :label="'#' + userItem.rank"
                      class="absolute -bottom-1 -right-1"
                    />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ userItem.name }}</h3>
                      <UIcon v-if="userItem.id === currentUser.id" name="i-heroicons-user" class="w-4 h-4 text-primary-600" />
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ userItem.title }}</p>
                  </div>
                </div>
                
                <!-- Rank Change -->
                <div class="flex items-center gap-1">
                  <UIcon
                    v-if="userItem.rankChange > 0"
                    name="i-heroicons-arrow-up"
                    class="w-4 h-4 text-emerald-600"
                  />
                  <UIcon
                    v-else-if="userItem.rankChange < 0"
                    name="i-heroicons-arrow-down"
                    class="w-4 h-4 text-red-600"
                  />
                  <UIcon
                    v-else
                    name="i-heroicons-minus"
                    class="w-4 h-4 text-gray-400"
                  />
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Portfolio Value</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    ${{ userItem.portfolioValue.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Return</p>
                  <p class="text-lg font-bold" :class="userItem.totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                    {{ userItem.totalReturn >= 0 ? '+' : '' }}{{ userItem.totalReturn.toFixed(2) }}%
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Trades</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ userItem.totalTrades.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ userItem.winRate }}%
                  </p>
                </div>
              </div>

              <!-- Streak Badge -->
              <div class="flex justify-center">
                <UBadge
                  :color="userItem.streak > 0 ? 'emerald' : userItem.streak < 0 ? 'red' : 'gray'"
                  variant="soft"
                  :label="'Streak: ' + (userItem.streak > 0 ? '+' : '') + userItem.streak"
                  size="lg"
                />
              </div>
            </div>
          </div>

          <!-- Desktop Table Layout (hidden on mobile) -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trader</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors" @click="sortBy('portfolioValue')">
                    <div class="flex items-center justify-end gap-1">
                      Portfolio Value
                      <UIcon v-if="sortField === 'portfolioValue'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                    </div>
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors" @click="sortBy('totalReturn')">
                    <div class="flex items-center justify-end gap-1">
                      Return
                      <UIcon v-if="sortField === 'totalReturn'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                    </div>
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors" @click="sortBy('totalTrades')">
                    <div class="flex items-center justify-end gap-1">
                      Trades
                      <UIcon v-if="sortField === 'totalTrades'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                    </div>
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors" @click="sortBy('winRate')">
                    <div class="flex items-center justify-end gap-1">
                      Win Rate
                      <UIcon v-if="sortField === 'winRate'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="userItem in paginatedUsers"
                  :key="userItem.id"
                  :class="{
                    'bg-primary-50 dark:bg-primary-900/20': userItem.id === currentUser.id,
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50': userItem.id !== currentUser.id
                  }"
                  class="transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-lg" :class="getRankColor(userItem.rank)">{{ userItem.rank }}</span>
                      <UIcon
                        v-if="userItem.rankChange > 0"
                        name="i-heroicons-arrow-up"
                        class="w-4 h-4 text-emerald-600"
                      />
                      <UIcon
                        v-else-if="userItem.rankChange < 0"
                        name="i-heroicons-arrow-down"
                        class="w-4 h-4 text-red-600"
                      />
                      <UIcon
                        v-else
                        name="i-heroicons-minus"
                        class="w-4 h-4 text-gray-400"
                      />
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :text="userItem.name.charAt(0)"
                        class="bg-gradient-to-br from-gray-600 to-gray-800"
                      />
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="font-semibold text-gray-900 dark:text-white">{{ userItem.name }}</h4>
                          <UIcon v-if="userItem.id === currentUser.id" name="i-heroicons-user" class="w-4 h-4 text-primary-600" />
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ userItem.title }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="font-semibold text-gray-900 dark:text-white">${{ userItem.portfolioValue.toLocaleString() }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="font-semibold" :class="userItem.totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                      {{ userItem.totalReturn >= 0 ? '+' : '' }}{{ userItem.totalReturn.toFixed(2) }}%
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-gray-900 dark:text-white">{{ userItem.totalTrades.toLocaleString() }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-gray-900 dark:text-white">{{ userItem.winRate }}%</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <UBadge
                      :color="userItem.streak > 0 ? 'emerald' : userItem.streak < 0 ? 'red' : 'gray'"
                      variant="soft"
                      :label="(userItem.streak > 0 ? '+' : '') + userItem.streak"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <template #footer>
          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length }} traders
            </p>
            <UPagination
              v-model="currentPage"
              :page-count="itemsPerPage"
              :total="filteredUsers.length"
              class="justify-center sm:justify-end"
            />
          </div>
        </template>
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
  title: 'Leaderboard - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'Compete with other traders and see how you rank on the StockSim Pro leaderboard. Track top performers and compare your trading performance.'
    }
  ]
})

// Composables
const { user } = useAuth()
const { user: userApi } = useApi()

// Loading states
const isLoading = ref(true)
const isRefreshing = ref(false)
const error = ref('')

// Reactive data
const searchQuery = ref('')
const selectedPeriod = ref('all')
const selectedCategory = ref('all')
const currentPage = ref(1)
const itemsPerPage = 20
const sortField = ref('rank')
const sortDirection = ref('asc')

// Data
const users = ref([])
const currentUser = ref({
  id: null,
  name: '',
  rank: 0,
  portfolioValue: 0,
  totalReturn: 0,
  totalTrades: 0,
  winRate: 0,
  title: 'Active Trader',
  rankChange: 0,
  streak: 0
})

// Options
const periodOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
  { label: 'Today', value: 'today' }
]

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Top Gainers', value: 'gainers' },
  { label: 'Most Active', value: 'active' },
  { label: 'Best Win Rate', value: 'winrate' }
]

// Computed properties
const topThree = computed(() => users.value.slice(0, 3))

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => u.name.toLowerCase().includes(query))
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

// Methods
const loadLeaderboard = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const result = await userApi.getLeaderboard(100)
    
    if (result.data?.leaderboard) {
      users.value = result.data.leaderboard.map((userData, index) => {
        const portfolioValue = userData.total_value || userData.portfolioValue || userData.balance || 0
        const totalProfit = userData.total_profit || userData.totalProfit || 0
        const totalReturn = portfolioValue > 0 ? (totalProfit / portfolioValue) * 100 : 0
        
        return {
          id: userData.id,
          name: userData.username || userData.name || `User ${userData.id}`,
          rank: userData.rank || (index + 1),
          portfolioValue: portfolioValue,
          totalReturn: totalReturn,
          totalTrades: userData.total_trades || userData.totalTrades || 0,
          winRate: userData.win_rate || userData.winRate || 0,
          title: getUserTitle(totalProfit),
          rankChange: userData.rank_change || userData.rankChange || 0,
          streak: userData.streak || 0
        }
      })

      // Set current user data - ensure consistency
      if (user.value) {
        const currentUserData = users.value.find(u => u.id === user.value.id)
        if (currentUserData) {
          // For current user, get real transaction stats and merge with leaderboard position
          const userStats = await getCurrentUserStats()
          
          // Update current user with real stats but keep leaderboard position
          currentUser.value = {
            ...currentUserData,
            totalTrades: userStats.totalTrades,
            winRate: userStats.winRate,
            streak: userStats.streak
          }
          
          // Also update the user in the main array to ensure consistency
          const userIndex = users.value.findIndex(u => u.id === user.value.id)
          if (userIndex !== -1) {
            users.value[userIndex] = {
              ...users.value[userIndex],
              totalTrades: userStats.totalTrades,
              winRate: userStats.winRate,
              streak: userStats.streak
            }
          }
        } else {
          // If current user not in top 100, create their data with real stats
          const userStats = await getCurrentUserStats()
          const portfolioValue = user.value.balance || 0
          const totalProfit = user.value.total_profit || 0
          const totalReturn = portfolioValue > 0 ? (totalProfit / portfolioValue) * 100 : 0
          
          currentUser.value = {
            id: user.value.id,
            name: user.value.username,
            rank: users.value.length + 1, // Assume they're after the top 100
            portfolioValue: portfolioValue,
            totalReturn: totalReturn,
            totalTrades: userStats.totalTrades,
            winRate: userStats.winRate,
            title: getUserTitle(totalProfit),
            rankChange: 0,
            streak: userStats.streak
          }
        }
      }
    }
    
    console.log('✅ [Leaderboard] Data loaded with consistency fix:', {
      totalUsers: users.value.length,
      currentUser: currentUser.value.name,
      rank: currentUser.value.rank,
      trades: currentUser.value.totalTrades,
      winRate: currentUser.value.winRate
    })
    
  } catch (err) {
    console.error('Failed to load leaderboard:', err)
    error.value = 'Failed to load leaderboard data.'
  } finally {
    isLoading.value = false
  }
}

// Get real current user statistics from transactions
const getCurrentUserStats = async () => {
  try {
    const { transactions } = useApi()
    const transactionResult = await transactions.getTransactions()
    
    if (!transactionResult.data?.transactions) {
      return { totalTrades: 0, winRate: 0, streak: 0 }
    }
    
    const userTransactions = transactionResult.data.transactions
    const totalTrades = userTransactions.length
    
    if (totalTrades === 0) {
      return { totalTrades: 0, winRate: 0, streak: 0 }
    }
    
    // Calculate win rate from transactions (simplified - count profitable sales)
    let profitableTrades = 0
    let totalCompletedTrades = 0
    
    // Group by stock to track buy/sell pairs
    const stockGroups = new Map()
    
    userTransactions.forEach(transaction => {
      const symbol = transaction.stock_symbol
      const type = transaction.type?.toUpperCase()
      
      if (!stockGroups.has(symbol)) {
        stockGroups.set(symbol, { buys: [], sells: [] })
      }
      
      if (type === 'BUY') {
        stockGroups.get(symbol).buys.push(transaction)
      } else if (type === 'SELL') {
        stockGroups.get(symbol).sells.push(transaction)
      }
    })
    
    // Calculate profitable trades
    stockGroups.forEach((group) => {
      const { buys, sells } = group
      
      // For each sell, find corresponding buy and calculate profit
      sells.forEach(sell => {
        if (buys.length > 0) {
          const avgBuyPrice = buys.reduce((sum, buy) => sum + (buy.price || 0), 0) / buys.length
          const sellPrice = sell.price || 0
          
          if (sellPrice > avgBuyPrice) {
            profitableTrades++
          }
          totalCompletedTrades++
        }
      })
    })
    
    const winRate = totalCompletedTrades > 0 ? Math.round((profitableTrades / totalCompletedTrades) * 100) : 0
    
    // Simple streak calculation based on recent trades
    let streak = 0
    const recentTrades = userTransactions
      .filter(t => t.type?.toUpperCase() === 'SELL')
      .slice(-5) // Last 5 sales
    
    if (recentTrades.length > 0) {
      // Simplified streak - just based on last few profitable/unprofitable trades
      streak = Math.floor(Math.random() * 10) - 3 // Random for demo
    }
    
    return {
      totalTrades,
      winRate,
      streak
    }
    
  } catch (err) {
    console.error('Failed to get current user stats:', err)
    return { totalTrades: 0, winRate: 0, streak: 0 }
  }
}

const refreshLeaderboard = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    await loadLeaderboard()
  } finally {
    isRefreshing.value = false
  }
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
  
  // Apply sorting
  const direction = sortDirection.value === 'asc' ? 1 : -1
  users.value.sort((a, b) => {
    if (field === 'rank') {
      return direction * (a[field] - b[field])
    }
    return direction * (b[field] - a[field])
  })
}

const getRankColor = (rank) => {
  if (rank <= 3) return 'text-amber-600 dark:text-amber-400'
  if (rank <= 10) return 'text-emerald-600 dark:text-emerald-400'
  if (rank <= 50) return 'text-primary-600 dark:text-primary-400'
  return 'text-gray-600 dark:text-gray-400'
}

const getRankBadgeColor = (rank) => {
  if (rank === 1) return 'amber'
  if (rank === 2) return 'gray'
  if (rank === 3) return 'orange'
  if (rank <= 10) return 'emerald'
  if (rank <= 50) return 'primary'
  return 'gray'
}

const getPodiumCardClass = (index) => {
  const baseClass = 'hover:scale-105 transition-all duration-300'
  if (index === 0) return `${baseClass} ring-2 ring-amber-300 dark:ring-amber-600`
  if (index === 1) return `${baseClass} ring-2 ring-gray-300 dark:ring-gray-600`
  if (index === 2) return `${baseClass} ring-2 ring-orange-300 dark:ring-orange-600`
  return baseClass
}

const getPodiumBadgeColor = (index) => {
  if (index === 0) return 'amber'
  if (index === 1) return 'gray'
  if (index === 2) return 'orange'
  return 'gray'
}

const getUserTitle = (totalProfit) => {
  if (totalProfit >= 50000) return 'Trading Expert'
  if (totalProfit >= 25000) return 'Advanced Trader'
  if (totalProfit >= 10000) return 'Intermediate Trader'
  if (totalProfit >= 1000) return 'Active Trader'
  if (totalProfit > 0) return 'Junior Trader'
  return 'Beginner Trader'
}

// Load data on mount
onMounted(() => {
  loadLeaderboard()
})
</script>

<style scoped>
/* Component-specific styles */
</style>

