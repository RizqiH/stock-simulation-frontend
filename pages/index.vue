<template>
  <div class="bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <UContainer class="pt-20 pb-32">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Hero Content -->
          <div>
            <UBadge 
              color="primary" 
              variant="subtle" 
              size="lg" 
              class="mb-6"
            >
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mr-2" />
              100% Risk-Free Virtual Trading
            </UBadge>
            
            <h1 class="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Master 
              <span class="bg-gradient-to-r from-primary-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Stock Trading
            </span>
              Without Risk
          </h1>
            
            <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Practice trading with virtual money, learn from real market data, and build your investment skills before risking real capital.
            </p>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 mb-12">
            <UButton
                v-if="!isAuthenticated"
              to="/register"
              size="xl"
                icon="i-heroicons-chart-bar-square"
                class="justify-center"
              >
                Start Trading for Free
              </UButton>
              
              <UButton 
                v-if="isAuthenticated"
                to="/dashboard" 
                size="xl"
                color="primary"
                variant="soft"
                icon="i-heroicons-squares-2x2"
                class="justify-center"
              >
                Go to Dashboard
            </UButton>
              
            <UButton
              to="/market"
                size="xl"
                color="gray"
              variant="outline"
                icon="i-heroicons-chart-bar"
                class="justify-center"
            >
              Explore Market
            </UButton>
            </div>
            
            <!-- Trust Indicators -->
            <div class="flex flex-wrap items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500" />
                <span>Real market data</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500" />
                <span>No financial risk</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500" />
                <span>Educational focused</span>
              </div>
            </div>
          </div>
          
          <!-- Hero Visual -->
          <div class="relative animate-slide-up" style="animation-delay: 0.3s;">
            <div class="relative">
              <!-- Main Dashboard Preview -->
              <div class="card-elevated p-8 backdrop-blur-xl bg-neutral-50/80 dark:bg-neutral-900/80">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="font-semibold text-lg text-neutral-900 dark:text-white">Portfolio Overview</h3>
                  <div class="badge-success">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    +12.5%
                  </div>
                </div>
                
                <!-- Virtual Portfolio Stats -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Value</p>
                    <p class="text-2xl font-bold text-neutral-900 dark:text-white">$125,430</p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Today's P&L</p>
                    <p class="text-2xl font-bold text-profit">+$2,340</p>
                  </div>
                </div>
                
                <!-- Mock Chart -->
                <div class="h-32 bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/20 rounded-lg flex items-end justify-between p-4">
                  <div class="w-3 bg-emerald-400 rounded-t" style="height: 60%;"></div>
                  <div class="w-3 bg-indigo-400 rounded-t" style="height: 80%;"></div>
                  <div class="w-3 bg-emerald-500 rounded-t" style="height: 45%;"></div>
                  <div class="w-3 bg-indigo-500 rounded-t" style="height: 90%;"></div>
                  <div class="w-3 bg-emerald-400 rounded-t" style="height: 70%;"></div>
                  <div class="w-3 bg-indigo-400 rounded-t" style="height: 55%;"></div>
                  <div class="w-3 bg-emerald-600 rounded-t" style="height: 85%;"></div>
                </div>
              </div>
              
              <!-- Floating Elements -->
              <div class="absolute -top-4 -right-4 card px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/30 animate-float">
                <div class="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Live Market</div>
              </div>
              
              <div class="absolute -bottom-4 -left-4 card px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700/30 animate-float" style="animation-delay: 1s;">
                <div class="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Risk Free</div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-gray-50/50 dark:bg-gray-900/50">
      <UContainer>
        <div class="text-center mb-20">
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Why Choose StockSim Pro?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Master the art of trading with our comprehensive simulation platform designed for both beginners and experienced traders.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <UCard class="p-8 hover:scale-105 transition-all duration-300">
            <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-chart-bar-square" class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Real Market Data</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Practice with actual stock prices and market movements. Experience real trading conditions without the financial risk.
            </p>
          </UCard>
          
          <!-- Feature 2 -->
          <UCard class="p-8 hover:scale-105 transition-all duration-300">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-shield-check" class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">100% Risk-Free</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Learn and experiment with different trading strategies using virtual money. Make mistakes without losing real capital.
            </p>
          </UCard>
          
          <!-- Feature 3 -->
          <UCard class="p-8 hover:scale-105 transition-all duration-300">
            <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-chart-pie" class="w-7 h-7 text-white" />
          </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Analytics</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Track your performance with comprehensive analytics, portfolio insights, and detailed transaction history.
            </p>
          </UCard>
          
          <!-- Feature 4 -->
          <UCard class="p-8 hover:scale-105 transition-all duration-300">
            <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-users" class="w-7 h-7 text-white" />
          </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Community Leaderboard</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Compete with other traders, see how you rank, and learn from the best performing virtual portfolios.
            </p>
          </UCard>
          
          <!-- Feature 5 -->
          <UCard class="p-8 hover:scale-105 transition-all duration-300">
            <div class="w-14 h-14 bg-gradient-to-br from-primary-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-academic-cap" class="w-7 h-7 text-white" />
          </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Educational Resources</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Access learning materials, trading guides, and market insights to improve your investment knowledge and skills.
            </p>
          </UCard>
          
          <!-- Feature 6 -->
          <UCard class="p-8 hover:scale-105 transition-all duration-300">
            <div class="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-heart" class="w-7 h-7 text-white" />
          </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">User-Friendly Interface</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Intuitive design makes trading easy for beginners while providing advanced features for experienced users.
            </p>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- Market Preview Section -->
    <section class="py-24" v-if="stocks.length > 0">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Live Market Preview
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See real-time stock data and start practicing your trading strategies with our most popular stocks.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard 
            v-for="stock in stocks.slice(0, 6)" 
            :key="stock.symbol"
            class="p-6 hover:scale-105 transition-all duration-300"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                  {{ stock.symbol }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ stock.name }}</p>
                </div>
                <div class="text-right">
                <p class="font-bold text-lg text-gray-900 dark:text-white">
                  ${{ stock.current_price?.toFixed(2) }}
                </p>
                <UBadge 
                  :color="(stock.current_price - stock.previous_close) >= 0 ? 'emerald' : 'red'"
                  variant="soft"
                  size="sm"
                >
                  {{ formatChange(stock.current_price - stock.previous_close) }}
                </UBadge>
              </div>
            </div>
            
            <!-- Mini Chart Visualization -->
            <div class="h-12 flex items-end justify-between">
              <div 
                v-for="i in 12" 
                :key="i"
                class="w-1.5 bg-gradient-to-t from-primary-200 to-primary-500 dark:from-primary-800 dark:to-primary-400 rounded-t"
                :style="{ height: `${Math.random() * 100}%` }"
              ></div>
            </div>
          </UCard>
        </div>

        <div class="text-center mt-12">
          <UButton 
            to="/market" 
            size="lg"
            icon="i-heroicons-chart-bar"
          >
            View Full Market
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-r from-primary-600 via-purple-600 to-emerald-600 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <UContainer class="relative">
        <div class="text-center">
          <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Trading Journey?
          </h2>
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are mastering their skills with StockSim Pro. Start practicing today with virtual money and real market data.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton 
              v-if="!isAuthenticated"
              to="/register" 
              size="xl"
              color="white"
              icon="i-heroicons-rocket-launch"
              class="justify-center"
            >
              Create Free Account
            </UButton>
            
            <UButton 
              v-if="isAuthenticated"
              to="/dashboard" 
              size="xl"
              color="white"
              icon="i-heroicons-squares-2x2"
              class="justify-center"
            >
              Go to Dashboard
            </UButton>
            
            <UButton 
              to="/market" 
              size="xl"
              variant="outline"
              color="white"
              icon="i-heroicons-eye"
              class="justify-center"
            >
              Explore Market
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup>
// Auth composable
const { isAuthenticated } = useAuth()

// API composable
const { stocks: stocksApi } = useApi()

// Reactive data
const stocks = ref([])
const isLoading = ref(false)
const error = ref(null)

// Load featured stocks
const loadStocks = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const result = await stocksApi.getTop(6)
    if (result.data?.stocks) {
      stocks.value = result.data.stocks
    } else {
      console.warn('No stocks data received from API')
      stocks.value = []
    }
  } catch (err) {
    error.value = err.message
    console.error('Failed to load stocks:', err)
  } finally {
    isLoading.value = false
  }
}

// Utility functions
const formatChange = (change) => {
  const symbol = change >= 0 ? '+' : ''
  return `${symbol}$${Math.abs(change).toFixed(2)}`
}

const getChangeClass = (change) => {
  return change >= 0 ? 'text-profit' : 'text-loss'
}

// Load data on mount
onMounted(() => {
  loadStocks()
})

// SEO
useHead({
  title: 'StockSim Pro - Master Stock Trading Without Risk',
  meta: [
    {
      name: 'description',
      content: 'Practice stock trading with virtual money using real market data. Build your investment skills risk-free with our advanced trading simulator.'
    },
    {
      property: 'og:title',
      content: 'StockSim Pro - Virtual Stock Trading Platform'
    },
    {
      property: 'og:description', 
      content: 'Master stock trading without financial risk. Practice with real market data and virtual money.'
    }
  ]
})
</script>

<style scoped>
/* Additional custom animations and styles */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-15px); 
  }
}

/* Hero gradient text animation */
.bg-gradient-to-r {
  background-size: 300% 300%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { 
    background-position: 0% 50%; 
  }
  50% { 
    background-position: 100% 50%; 
  }
  100% { 
    background-position: 0% 50%; 
  }
}

/* Hover effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-indigo-600 {
  color: rgb(79 70 229);
}

.dark .group:hover .group-hover\:text-indigo-400 {
  color: rgb(129 140 248);
}
</style>

