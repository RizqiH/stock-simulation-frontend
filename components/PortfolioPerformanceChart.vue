<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg lg:text-xl font-bold">Portfolio Performance</h3>
          <!-- Real-time indicator -->
          <div v-if="props.realTime" class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs lg:text-sm text-green-600 dark:text-green-400 font-medium">LIVE</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Period Selector -->
          <USelectMenu
            v-model="selectedPeriod"
            :options="periodOptions"
            value-attribute="value"
            option-attribute="label"
            class="w-16 lg:w-20"
            @change="onPeriodChange"
          />
          
          <!-- Refresh Button -->
          <UButton
            @click="refreshChart"
            :loading="isLoading"
            variant="outline"
            size="sm"
            icon="i-heroicons-arrow-path"
            class="flex-shrink-0"
          />
        </div>
      </div>
    </template>

    <!-- Chart Container -->
    <div class="relative">
      <!-- Loading State -->
      <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
        <div class="text-center">
          <USkeleton class="h-6 lg:h-8 w-32 lg:w-48 mx-auto mb-4" />
          <div class="w-6 h-6 lg:w-8 lg:h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400">Loading performance data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="p-4 lg:p-8 text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 lg:w-12 lg:h-12 text-red-500 mx-auto mb-4" />
        <h4 class="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2">Chart Error</h4>
        <p class="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <UButton @click="loadData" variant="outline" size="sm">
          Retry
        </UButton>
      </div>

      <!-- Chart Component -->
      <div v-show="!isLoading && !error">
        <ClientOnly>
          <apexchart
            type="area"
            :height="responsiveChartHeight"
            :options="responsiveChartOptions"
            :series="chartSeries"
          />
          <template #fallback>
            <div :class="chartContainerClass" class="bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <div class="text-center">
                <div class="w-6 h-6 lg:w-8 lg:h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-sm lg:text-base text-gray-600 dark:text-gray-400">Loading chart...</p>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Portfolio Metrics -->
    <div v-if="metrics && !isLoading && props.showMetrics" class="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">Performance Metrics</h4>
      
      <!-- Mobile: 2 columns, Desktop: 4 columns -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <!-- Total Return -->
        <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Return</p>
          <p :class="[
            'text-base lg:text-xl font-bold',
            metrics.totalReturnPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          ]">
            {{ metrics.totalReturnPct >= 0 ? '+' : '' }}{{ metrics.totalReturnPct.toFixed(1) }}%
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ${{ formatNumber(metrics.totalReturn) }}
          </p>
        </div>

        <!-- Annualized Return -->
        <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Annualized</p>
          <p :class="[
            'text-base lg:text-xl font-bold',
            metrics.annualizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          ]">
            {{ metrics.annualizedReturn >= 0 ? '+' : '' }}{{ metrics.annualizedReturn.toFixed(1) }}%
          </p>
        </div>

        <!-- Volatility -->
        <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Volatility</p>
          <p class="text-base lg:text-xl font-bold text-gray-900 dark:text-white">
            {{ metrics.volatility.toFixed(1) }}%
          </p>
        </div>

        <!-- Sharpe Ratio -->
        <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Sharpe Ratio</p>
          <p :class="[
            'text-base lg:text-xl font-bold',
            metrics.sharpeRatio >= 1 ? 'text-green-600 dark:text-green-400' : 
            metrics.sharpeRatio >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 
            'text-red-600 dark:text-red-400'
          ]">
            {{ metrics.sharpeRatio.toFixed(1) }}
          </p>
        </div>

        <!-- Mobile: Additional metrics in hidden expandable section -->
        <template v-if="showAllMetrics">
          <!-- Max Drawdown -->
          <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
            <p class="text-base lg:text-xl font-bold text-red-600 dark:text-red-400">
              -{{ metrics.maxDrawdown.toFixed(1) }}%
            </p>
          </div>

          <!-- Best Day -->
          <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Best Day</p>
            <p class="text-base lg:text-xl font-bold text-green-600 dark:text-green-400">
              +{{ metrics.bestDay.toFixed(1) }}%
            </p>
          </div>

          <!-- Worst Day -->
          <div class="text-center p-3 lg:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Worst Day</p>
            <p class="text-base lg:text-xl font-bold text-red-600 dark:text-red-400">
              {{ metrics.worstDay.toFixed(1) }}%
            </p>
          </div>
        </template>

        <!-- Show More/Less Button (Mobile and Desktop) -->
        <div class="col-span-2 lg:col-span-1 text-center p-3 lg:p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
          <UButton
            @click="toggleMetrics"
            variant="ghost"
            size="sm"
            class="text-white hover:bg-white/20 w-full"
          >
            <UIcon :name="showAllMetrics ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4 mr-1" />
            {{ showAllMetrics ? 'Less' : 'More' }} Stats
          </UButton>
        </div>
      </div>
    </div>

    <!-- Detailed Stats Modal -->
    <UModal v-model="showDetailedStats">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Detailed Portfolio Statistics</h3>
        </template>
        
        <div v-if="metrics" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Return</p>
              <p class="text-lg font-bold">${{ metrics.totalReturn.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Return %</p>
              <p class="text-lg font-bold">{{ metrics.totalReturnPct.toFixed(4) }}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Annualized Return</p>
              <p class="text-lg font-bold">{{ metrics.annualizedReturn.toFixed(4) }}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Volatility (Annual)</p>
              <p class="text-lg font-bold">{{ metrics.volatility.toFixed(4) }}%</p>
            </div>
          </div>
        </div>
        
        <template #footer>
          <UButton @click="showDetailedStats = false" variant="outline" block>
            Close
          </UButton>
        </template>
      </UCard>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">

// Props
interface Props {
  height?: number
  realTime?: boolean
  showMetrics?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  realTime: true,
  showMetrics: true
})

// Composables
const colorMode = useColorMode()

// Reactive state
const isLoading = ref(true)
const error = ref('')
const showDetailedStats = ref(false)
const showAllMetrics = ref(false)

// Chart configuration
const selectedPeriod = ref({ label: '1M', value: '1M', days: 30 })
const periodOptions = [
  { label: '1D', value: '1D', days: 1 },
  { label: '1W', value: '1W', days: 7 },
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: 'ALL', value: 'ALL', days: 0 }
]

// Responsive chart configuration
const responsiveChartHeight = computed(() => {
  if (process.client && window.innerWidth < 1024) {
    return 250 // Mobile height
  }
  return props.height
})

const chartContainerClass = computed(() => {
  return 'h-48 lg:h-64'
})

const responsiveChartOptions = computed(() => {
  if (!chartOptions.value) return null
  
  const baseOptions = { ...chartOptions.value }
  
  if (process.client && window.innerWidth < 1024) {
    return {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        toolbar: {
          show: false // Hide toolbar on mobile
        }
      },
      title: {
        ...baseOptions.title,
        style: {
          ...baseOptions.title?.style,
          fontSize: '14px'
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
        ...baseOptions.legend,
        position: 'bottom',
        fontSize: '12px'
      }
    }
  }
  
  return baseOptions
})

const chartHeight = computed(() => props.height)

// Chart data
const chartData = ref([])
const metrics = ref(null)

// Generate mock data
const generateMockData = (period) => {
  const dataPoints = []
  const startDate = period.value === 'ALL' ? 
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) : 
    new Date(Date.now() - period.days * 24 * 60 * 60 * 1000)
  
  const initialValue = 50000
  const initialCost = 45000
  let currentValue = initialValue
  let currentCost = initialCost

  const dayInterval = period.days <= 30 ? 1 : period.days <= 90 ? 3 : 7

  for (let i = 0; i <= period.days || period.value === 'ALL'; i += dayInterval) {
    if (period.value === 'ALL' && i > 365) break

    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    
    // Simulate market movements
    const randomChange = (Math.random() - 0.5) * 2 * 0.02
    const marketTrend = Math.sin(i / 30) * 0.001
    const totalChange = randomChange + marketTrend
    
    currentValue *= (1 + totalChange)
    
    // Occasionally add investments
    if (Math.random() < 0.05) {
      const additionalInvestment = Math.random() * 2000
      currentCost += additionalInvestment
      currentValue += additionalInvestment
    }
    
    const profitLoss = currentValue - currentCost
    const profitLossPct = currentCost > 0 ? (profitLoss / currentCost) * 100 : 0
    
    dataPoints.push({
      date: currentDate.toISOString(),
      totalValue: Math.max(0, currentValue),
      totalCost: currentCost,
      profitLoss,
      profitLossPct,
      cashValue: 5000,
      investmentValue: Math.max(0, currentValue - 5000)
    })
  }

  return dataPoints
}

// Calculate metrics
const calculateMetrics = (dataPoints) => {
  if (!dataPoints || dataPoints.length === 0) {
    return {
      totalReturn: 0,
      totalReturnPct: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      bestDay: 0,
      worstDay: 0
    }
  }

  const sortedData = [...dataPoints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const firstValue = sortedData[0].totalValue
  const lastValue = sortedData[sortedData.length - 1].totalValue
  const totalReturn = lastValue - firstValue
  const totalReturnPct = firstValue > 0 ? (totalReturn / firstValue) * 100 : 0

  // Calculate daily returns
  const dailyReturns = []
  for (let i = 1; i < sortedData.length; i++) {
    const prevValue = sortedData[i - 1].totalValue
    const currentValue = sortedData[i].totalValue
    if (prevValue > 0) {
      dailyReturns.push((currentValue - prevValue) / prevValue)
    }
  }

  // Volatility (annualized)
  const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length || 0
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length || 0
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100

  // Best and worst days
  const bestDay = dailyReturns.length > 0 ? Math.max(...dailyReturns) * 100 : 0
  const worstDay = dailyReturns.length > 0 ? Math.min(...dailyReturns) * 100 : 0

  // Max drawdown
  let peak = firstValue
  let maxDrawdown = 0
  for (const point of sortedData) {
    if (point.totalValue > peak) {
      peak = point.totalValue
    }
    const drawdown = peak > 0 ? (peak - point.totalValue) / peak * 100 : 0
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  // Annualized return
  const daysDiff = (new Date(sortedData[sortedData.length - 1].date).getTime() - 
                   new Date(sortedData[0].date).getTime()) / (1000 * 60 * 60 * 24)
  const annualizedReturn = daysDiff > 0 && firstValue > 0 ? 
    (Math.pow(lastValue / firstValue, 365 / daysDiff) - 1) * 100 : 0

  const riskFreeRate = 2
  const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0

  return {
    totalReturn,
    totalReturnPct,
    annualizedReturn,
    volatility,
    sharpeRatio,
    maxDrawdown,
    bestDay,
    worstDay
  }
}

// Chart series
const chartSeries = computed(() => {
  if (!chartData.value || chartData.value.length === 0) {
    return []
  }

  return [
    {
      name: 'Portfolio Value',
      data: chartData.value.map(point => [
        new Date(point.date).getTime(),
        point.totalValue
      ]),
      color: '#3b82f6'
    },
    {
      name: 'Total Invested',
      data: chartData.value.map(point => [
        new Date(point.date).getTime(),
        point.totalCost
      ]),
      color: '#8b5cf6'
    }
  ]
})

// Chart options
const chartOptions = computed(() => {
  const isDark = colorMode.value === 'dark'
  
  return {
    chart: {
      type: 'area',
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
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    title: {
      text: `Portfolio Performance - ${selectedPeriod.value.label}`,
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: isDark ? '#ffffff' : '#374151'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    grid: {
      show: true,
      borderColor: isDark ? '#374151' : '#e5e7eb',
      strokeDashArray: 3
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
        formatter: (value) => {
          if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`
          } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`
          }
          return `$${value.toFixed(0)}`
        }
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: isDark ? '#9ca3af' : '#6b7280'
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value) => {
          return `$${value.toLocaleString()}`
        }
      }
    }
  }
})

// Methods
const loadData = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // Debug authentication status
    const { isAuthenticated } = useAuth()
    const token = useCookie('auth-token')
    
    console.log('🔍 [PortfolioChart] Auth debug:', {
      isAuthenticated: isAuthenticated.value,
      hasToken: !!token.value,
      tokenValue: token.value ? 'exists' : 'missing'
    })

    // Check if user is authenticated
    if (!isAuthenticated.value) {
      console.log('⚠️ [PortfolioChart] User not authenticated, using mock data')
      const data = generateMockData(selectedPeriod.value)
      chartData.value = data
      metrics.value = calculateMetrics(data)
      return
    }

    // Use API instead of mock data
    const { portfolio } = useApi()
    const response = await portfolio.getPerformance(selectedPeriod.value.value)
    
    console.log('🔍 [PortfolioChart] API Response:', response)
    console.log('🔍 [PortfolioChart] response.data:', response.data)
    console.log('🔍 [PortfolioChart] response.data.data:', response.data?.data)
    
    // Fix: Check for response.data.data (nested structure)
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('✅ [PortfolioChart] Using real API data:', response.data.data.length, 'points')
      
      // Transform API response to expected format
      const data = response.data.data.map(point => ({
        date: point.date,
        totalValue: point.total_value || point.totalValue,
        totalCost: point.total_cost || point.totalCost,
        profitLoss: point.profit_loss || point.profitLoss,
        profitLossPct: point.profit_loss_pct || point.profitLossPct,
        cashValue: point.cash_value || point.cashValue || 5000,
        investmentValue: point.investment_value || point.investmentValue
      }))
      
      chartData.value = data
      metrics.value = calculateMetrics(data)
    } else {
      // Fallback to mock data if no API data
      console.log('⚠️ [PortfolioChart] No API data, using mock data')
      const data = generateMockData(selectedPeriod.value)
      chartData.value = data
      metrics.value = calculateMetrics(data)
    }

    console.log('✅ [PortfolioChart] Data loaded:', {
      period: selectedPeriod.value.label,
      dataPoints: chartData.value.length,
      metrics: metrics.value
    })

  } catch (err: any) {
    console.error('❌ [PortfolioChart] Failed to load API data:', err)
    
    // If it's an auth error, use mock data instead
    if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      console.log('🔒 [PortfolioChart] Auth error detected, using mock data as fallback')
    } else {
      console.log('⚠️ [PortfolioChart] General error, using mock data as fallback')
    }
    
    // Fallback to mock data on error
    try {
      const data = generateMockData(selectedPeriod.value)
      chartData.value = data
      metrics.value = calculateMetrics(data)
    } catch (mockErr) {
      console.error('❌ [PortfolioChart] Failed to generate mock data:', mockErr)
      error.value = 'Failed to load chart data'
    }
  } finally {
    isLoading.value = false
  }
}

const onPeriodChange = async () => {
  await loadData()
}

const refreshChart = async () => {
  await loadData()
}

const formatNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

const toggleMetrics = () => {
  showAllMetrics.value = !showAllMetrics.value
}

// Real-time updates
let realtimeInterval = null

const startRealtimeUpdates = () => {
  if (realtimeInterval) return
  
  realtimeInterval = setInterval(() => {
    if (chartData.value && chartData.value.length > 0) {
      const lastPoint = chartData.value[chartData.value.length - 1]
      const volatility = 0.02
      const randomChange = (Math.random() - 0.5) * 2 * volatility
      
      const newTotalValue = lastPoint.totalValue * (1 + randomChange)
      const newProfitLoss = newTotalValue - lastPoint.totalCost
      const newProfitLossPct = lastPoint.totalCost > 0 ? (newProfitLoss / lastPoint.totalCost) * 100 : 0

      const newDataPoint = {
        date: new Date().toISOString(),
        totalValue: newTotalValue,
        totalCost: lastPoint.totalCost,
        profitLoss: newProfitLoss,
        profitLossPct: newProfitLossPct,
        cashValue: lastPoint.cashValue,
        investmentValue: newTotalValue - lastPoint.cashValue
      }

      chartData.value.push(newDataPoint)
      
      // Keep only last 100 points
      if (chartData.value.length > 100) {
        chartData.value = chartData.value.slice(-100)
      }
      
      // Recalculate metrics
      metrics.value = calculateMetrics(chartData.value)
    }
  }, 5000) // Update every 5 seconds
}

const stopRealtimeUpdates = () => {
  if (realtimeInterval) {
    clearInterval(realtimeInterval)
    realtimeInterval = null
  }
}

// Lifecycle
onMounted(async () => {
  await loadData()
  if (props.realTime) {
    startRealtimeUpdates()
  }
})

onUnmounted(() => {
  stopRealtimeUpdates()
})

// Watch for theme changes
watch(() => colorMode.value, () => {
  // Chart will automatically update via computed chartOptions
})
</script>

<style scoped>
/* Custom styles for the chart component */
</style> 