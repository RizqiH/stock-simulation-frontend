import { PortfolioDataService } from '~/services/PortfolioDataService'
import { PortfolioChart } from '~/utils/charts/PortfolioChart'
import type { PortfolioDataPoint, PortfolioMetrics, ChartPeriod } from '~/types/chart'

export const usePortfolioCharts = () => {
  // Get singleton service instance
  const dataService = PortfolioDataService.getInstance()

  // Reactive state
  const isLoading = ref(false)
  const error = ref('')
  const chartData = ref<PortfolioDataPoint[]>([])
  const metrics = ref<PortfolioMetrics | null>(null)
  const currentPeriod = ref<ChartPeriod>(PortfolioDataService.PERIODS[2]) // Default to 1M

  // Available periods
  const availablePeriods = computed(() => PortfolioDataService.PERIODS)

  /**
   * Load portfolio chart data
   */
  const loadChartData = async (period?: ChartPeriod, forceRefresh: boolean = false) => {
    try {
      isLoading.value = true
      error.value = ''

      const targetPeriod = period || currentPeriod.value
      const portfolioData = await dataService.fetchPortfolioData(targetPeriod, forceRefresh)
      
      chartData.value = portfolioData.dataPoints
      metrics.value = portfolioData.metrics
      currentPeriod.value = targetPeriod

      console.log('✅ [usePortfolioCharts] Data loaded:', {
        period: targetPeriod.label,
        dataPoints: portfolioData.dataPoints.length,
        metrics: portfolioData.metrics
      })

      return portfolioData

    } catch (err: any) {
      console.error('❌ [usePortfolioCharts] Failed to load data:', err)
      error.value = err.message || 'Failed to load chart data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change chart period
   */
  const changePeriod = async (period: ChartPeriod) => {
    if (period.value === currentPeriod.value.value) return
    
    currentPeriod.value = period
    await loadChartData(period, true) // Force refresh for new period
  }

  /**
   * Refresh current chart data
   */
  const refreshChart = async () => {
    await loadChartData(currentPeriod.value, true)
  }

  /**
   * Get portfolio metrics
   */
  const getMetrics = () => metrics.value

  /**
   * Get chart data
   */
  const getChartData = () => chartData.value

  /**
   * Clear cache
   */
  const clearCache = () => {
    dataService.clearCache()
  }

  /**
   * Real-time update simulation (for development)
   */
  const startRealtimeUpdates = (intervalMs: number = 5000) => {
    const interval = setInterval(async () => {
      if (chartData.value.length > 0) {
        try {
          // Generate random price update
          const lastPoint = chartData.value[chartData.value.length - 1]
          const volatility = 0.02 // 2% daily volatility
          const randomChange = (Math.random() - 0.5) * 2 * volatility
          
          const newTotalValue = lastPoint.totalValue * (1 + randomChange)
          const newProfitLoss = newTotalValue - lastPoint.totalCost
          const newProfitLossPct = lastPoint.totalCost > 0 ? (newProfitLoss / lastPoint.totalCost) * 100 : 0

          const newDataPoint: PortfolioDataPoint = {
            date: new Date().toISOString(),
            totalValue: newTotalValue,
            totalCost: lastPoint.totalCost,
            profitLoss: newProfitLoss,
            profitLossPct: newProfitLossPct,
            cashValue: lastPoint.cashValue,
            investmentValue: newTotalValue - lastPoint.cashValue
          }

          chartData.value.push(newDataPoint)
          
          // Keep only last 100 points for performance
          if (chartData.value.length > 100) {
            chartData.value = chartData.value.slice(-100)
          }
          
          // Recalculate metrics using static method
          metrics.value = PortfolioChart.calculateMetrics(chartData.value)
          
          console.log('📊 [usePortfolioCharts] Real-time update:', newDataPoint)
        } catch (err) {
          console.error('❌ [usePortfolioCharts] Real-time update failed:', err)
        }
      }
    }, intervalMs)

    // Return cleanup function
    return () => clearInterval(interval)
  }

  /**
   * Calculate custom metrics
   */
  const calculateCustomMetrics = (dataPoints: PortfolioDataPoint[]) => {
    return PortfolioChart.calculateMetrics(dataPoints)
  }

  /**
   * Export chart data
   */
  const exportChartData = (format: 'json' | 'csv' = 'json') => {
    const data = {
      period: currentPeriod.value,
      metrics: metrics.value,
      dataPoints: chartData.value,
      exportedAt: new Date().toISOString()
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-data-${currentPeriod.value.value}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // CSV export
      const csvHeaders = ['Date', 'Total Value', 'Total Cost', 'Profit/Loss', 'Profit/Loss %', 'Cash Value', 'Investment Value']
      const csvRows = chartData.value.map(point => [
        point.date,
        point.totalValue,
        point.totalCost,
        point.profitLoss,
        point.profitLossPct,
        point.cashValue,
        point.investmentValue
      ])
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-data-${currentPeriod.value.value}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    chartData: readonly(chartData),
    metrics: readonly(metrics),
    currentPeriod: readonly(currentPeriod),
    availablePeriods,

    // Methods
    loadChartData,
    changePeriod,
    refreshChart,
    getMetrics,
    getChartData,
    clearCache,
    startRealtimeUpdates,
    calculateCustomMetrics,
    exportChartData
  }
} 