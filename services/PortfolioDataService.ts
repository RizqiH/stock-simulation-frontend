import type { 
  PortfolioDataPoint, 
  PortfolioMetrics, 
  ChartPeriod, 
  PortfolioChartData 
} from '~/types/chart'

export class PortfolioDataService {
  private static instance: PortfolioDataService
  private dataCache: Map<string, PortfolioDataPoint[]> = new Map()
  private lastFetchTime: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Predefined time periods
  public static readonly PERIODS: ChartPeriod[] = [
    { label: '1D', value: '1D', days: 1 },
    { label: '1W', value: '1W', days: 7 },
    { label: '1M', value: '1M', days: 30 },
    { label: '3M', value: '3M', days: 90 },
    { label: '6M', value: '6M', days: 180 },
    { label: '1Y', value: '1Y', days: 365 },
    { label: 'ALL', value: 'ALL', days: 0 }
  ]

  private constructor() {
    // Singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PortfolioDataService {
    if (!PortfolioDataService.instance) {
      PortfolioDataService.instance = new PortfolioDataService()
    }
    return PortfolioDataService.instance
  }

  /**
   * Fetch portfolio performance data for a specific period
   */
  public async fetchPortfolioData(
    period: ChartPeriod = PortfolioDataService.PERIODS[2], // Default to 1M
    forceRefresh: boolean = false
  ): Promise<PortfolioChartData> {
    const cacheKey = `portfolio_${period.value}`
    
    // Check cache first
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this.dataCache.get(cacheKey)
      if (cachedData) {
        return this.buildChartData(cachedData, period)
      }
    }

    try {
      // Generate mock data for now - replace with actual API call
      const dataPoints = await this.generateMockData(period)
      
      // Cache the data
      this.dataCache.set(cacheKey, dataPoints)
      this.lastFetchTime.set(cacheKey, Date.now())
      
      return this.buildChartData(dataPoints, period)
    } catch (error) {
      console.error('❌ [PortfolioDataService] Failed to fetch portfolio data:', error)
      
      // Return empty data on error
      return this.buildChartData([], period)
    }
  }

  /**
   * Generate mock portfolio data
   */
  private async generateMockData(period: ChartPeriod): Promise<PortfolioDataPoint[]> {
    const dataPoints: PortfolioDataPoint[] = []
    const startDate = period.value === 'ALL' ? 
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) : // 1 year ago
      new Date(Date.now() - period.days * 24 * 60 * 60 * 1000)
    
    const initialValue = 50000 // Starting portfolio value
    const initialCost = 45000 // Initial investment
    const initialCash = 5000 // Initial cash

    let currentValue = initialValue
    let currentCost = initialCost
    const currentCash = initialCash

    const dayInterval = period.days <= 30 ? 1 : // Daily for 1M or less
                       period.days <= 90 ? 3 : // Every 3 days for 3M
                       7 // Weekly for longer periods

    for (let i = 0; i <= period.days || period.value === 'ALL'; i += dayInterval) {
      if (period.value === 'ALL' && i > 365) break // Limit ALL to 1 year

      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      
      // Simulate market movements
      const randomChange = (Math.random() - 0.5) * 2 * 0.02 // 2% volatility
      const marketTrend = Math.sin(i / 30) * 0.001 // Slight trend
      const totalChange = randomChange + marketTrend
      
      currentValue *= (1 + totalChange)
      
      // Occasionally add investments
      if (Math.random() < 0.05) { // 5% chance to add investment
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
        cashValue: currentCash,
        investmentValue: Math.max(0, currentValue - currentCash)
      })
    }

    return dataPoints
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const lastFetch = this.lastFetchTime.get(cacheKey)
    if (!lastFetch) return false
    
    return (Date.now() - lastFetch) < this.CACHE_DURATION
  }

  /**
   * Build complete chart data object
   */
  private buildChartData(dataPoints: PortfolioDataPoint[], period: ChartPeriod): PortfolioChartData {
    const metrics = this.calculateMetricsFromData(dataPoints)
    
    return {
      periods: [...PortfolioDataService.PERIODS],
      dataPoints,
      metrics
    }
  }

  /**
   * Calculate portfolio metrics from data
   */
  private calculateMetricsFromData(dataPoints: PortfolioDataPoint[]): PortfolioMetrics {
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
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized

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

    // Sharpe ratio (assuming 2% risk-free rate)
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
} 