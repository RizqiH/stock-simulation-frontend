import { BaseChart } from '~/types/chart'
import type { 
  PortfolioDataPoint, 
  ChartConfig, 
  ChartSeries, 
  PortfolioMetrics,
  ChartEventHandlers,
  ChartPeriod
} from '~/types/chart'

export class PortfolioChart extends BaseChart {
  private chart: any = null
  private eventHandlers: ChartEventHandlers = {}
  private currentPeriod: ChartPeriod | null = null
  private metrics: PortfolioMetrics | null = null

  constructor(
    container: string | HTMLElement, 
    config: Partial<ChartConfig> = {},
    eventHandlers: ChartEventHandlers = {}
  ) {
    super(container, config)
    this.eventHandlers = eventHandlers
  }

  /**
   * Render the portfolio performance chart
   */
  render(): void {
    if (this.chart) {
      this.destroy()
    }

    const options = this.generateChartOptions()
    
    if (process.client && window.ApexCharts) {
      this.chart = new window.ApexCharts(this.container, options)
      this.chart.render()
    }
  }

  /**
   * Update chart data with new portfolio information
   */
  updateData(dataPoints: PortfolioDataPoint[]): void {
    this.data = dataPoints
    
    if (this.chart && dataPoints.length > 0) {
      const series = this.generateSeries(dataPoints)
      this.chart.updateSeries(series)
    }
  }

  /**
   * Update portfolio metrics
   */
  updateMetrics(metrics: PortfolioMetrics): void {
    this.metrics = metrics
    this.triggerMetricsUpdate()
  }

  /**
   * Change time period and update chart
   */
  changePeriod(period: ChartPeriod): void {
    this.currentPeriod = period
    
    if (this.eventHandlers.onPeriodChange) {
      this.eventHandlers.onPeriodChange(period)
    }
    
    // Update chart with filtered data based on period
    const filteredData = this.filterDataByPeriod(this.data, period)
    this.updateData(filteredData)
  }

  /**
   * Set chart theme (light/dark)
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme
    
    if (this.chart) {
      const options = this.generateChartOptions()
      this.chart.updateOptions(options)
    }
  }

  /**
   * Destroy chart instance
   */
  destroy(): void {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }

  /**
   * Get current portfolio metrics
   */
  getMetrics(): PortfolioMetrics | null {
    return this.metrics
  }

  /**
   * Add benchmark comparison data
   */
  addBenchmark(benchmarkData: PortfolioDataPoint[], benchmarkName: string = 'S&P 500'): void {
    if (this.chart && benchmarkData.length > 0) {
      const benchmarkSeries = this.generateBenchmarkSeries(benchmarkData, benchmarkName)
      this.chart.appendSeries(benchmarkSeries)
    }
  }

  /**
   * Generate ApexCharts configuration
   */
  private generateChartOptions(): any {
    const isDark = this.config.theme === 'dark'
    const series = this.generateSeries(this.data)

    return {
      series,
      chart: {
        type: 'area',
        height: this.config.height,
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
        animations: this.config.animations,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            if (this.eventHandlers.onDataPointClick && this.data[config.dataPointIndex]) {
              this.eventHandlers.onDataPointClick(this.data[config.dataPointIndex])
            }
          }
        }
      },
      title: {
        text: this.config.title,
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
        show: this.config.showGrid,
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
          formatter: (value: number) => {
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
        show: this.config.showLegend,
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
          formatter: (value: number, { seriesIndex }: any) => {
            if (seriesIndex === 1) { // Profit/Loss series
              return `${value >= 0 ? '+' : ''}$${value.toLocaleString()}`
            }
            return `$${value.toLocaleString()}`
          }
        }
      },
      responsive: this.config.responsive ? [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ] : []
    }
  }

  /**
   * Generate chart series from portfolio data
   */
  private generateSeries(dataPoints: PortfolioDataPoint[]): ChartSeries[] {
    if (!dataPoints || dataPoints.length === 0) {
      return []
    }

    const portfolioValueSeries = {
      name: 'Portfolio Value',
      data: dataPoints.map(point => ({
        x: new Date(point.date).getTime(),
        y: point.totalValue
      })),
      color: '#3b82f6'
    }

    const profitLossSeries = {
      name: 'Profit/Loss',
      data: dataPoints.map(point => ({
        x: new Date(point.date).getTime(),
        y: point.profitLoss
      })),
      color: '#10b981'
    }

    const investmentSeries = {
      name: 'Total Invested',
      data: dataPoints.map(point => ({
        x: new Date(point.date).getTime(),
        y: point.totalCost
      })),
      color: '#8b5cf6'
    }

    return [portfolioValueSeries, profitLossSeries, investmentSeries]
  }

  /**
   * Generate benchmark comparison series
   */
  private generateBenchmarkSeries(benchmarkData: PortfolioDataPoint[], name: string): ChartSeries {
    return {
      name,
      data: benchmarkData.map(point => ({
        x: new Date(point.date).getTime(),
        y: point.totalValue
      })),
      color: '#ef4444'
    }
  }

  /**
   * Filter data by time period
   */
  private filterDataByPeriod(data: PortfolioDataPoint[], period: ChartPeriod): PortfolioDataPoint[] {
    if (!data || data.length === 0 || period.value === 'ALL') {
      return data
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - period.days)

    return data.filter(point => new Date(point.date) >= cutoffDate)
  }

  /**
   * Trigger metrics update event
   */
  private triggerMetricsUpdate(): void {
    // This could trigger UI updates for metrics display
    console.log('📊 Portfolio metrics updated:', this.metrics)
  }

  /**
   * Calculate portfolio metrics from data points
   */
  static calculateMetrics(dataPoints: PortfolioDataPoint[]): PortfolioMetrics {
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

    // Calculate daily returns for volatility and other metrics
    const dailyReturns = []
    for (let i = 1; i < sortedData.length; i++) {
      const prevValue = sortedData[i - 1].totalValue
      const currentValue = sortedData[i].totalValue
      if (prevValue > 0) {
        dailyReturns.push((currentValue - prevValue) / prevValue)
      }
    }

    // Volatility (standard deviation of daily returns)
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const volatility = Math.sqrt(
      dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length
    ) * Math.sqrt(252) * 100 // Annualized

    // Best and worst days
    const bestDay = Math.max(...dailyReturns) * 100
    const worstDay = Math.min(...dailyReturns) * 100

    // Simplified max drawdown calculation
    let peak = firstValue
    let maxDrawdown = 0
    for (const point of sortedData) {
      if (point.totalValue > peak) {
        peak = point.totalValue
      }
      const drawdown = (peak - point.totalValue) / peak * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    // Annualized return (simplified)
    const daysDiff = (new Date(sortedData[sortedData.length - 1].date).getTime() - 
                     new Date(sortedData[0].date).getTime()) / (1000 * 60 * 60 * 24)
    const annualizedReturn = daysDiff > 0 ? 
      (Math.pow(lastValue / firstValue, 365 / daysDiff) - 1) * 100 : 0

    return {
      totalReturn,
      totalReturnPct,
      annualizedReturn,
      volatility,
      sharpeRatio: volatility > 0 ? (annualizedReturn - 2) / volatility : 0, // Assuming 2% risk-free rate
      maxDrawdown,
      bestDay,
      worstDay
    }
  }
} 