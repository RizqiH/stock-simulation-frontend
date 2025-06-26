// Portfolio Chart System Types & Interfaces

export interface PortfolioDataPoint {
  date: string
  totalValue: number
  totalCost: number
  profitLoss: number
  profitLossPct: number
  cashValue: number
  investmentValue: number
}

export interface ChartSeries {
  name: string
  data: Array<{ x: number | string; y: number }>
  color?: string
  type?: 'line' | 'area' | 'bar' | 'column'
}

export interface ChartConfig {
  title: string
  height: number
  theme: 'light' | 'dark'
  showGrid: boolean
  showLegend: boolean
  responsive: boolean
  animations: {
    enabled: boolean
    speed: number
  }
}

export interface PortfolioMetrics {
  totalReturn: number
  totalReturnPct: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  bestDay: number
  worstDay: number
}

export interface ChartPeriod {
  label: string
  value: string
  days: number
}

export interface PortfolioChartData {
  periods: ChartPeriod[]
  dataPoints: PortfolioDataPoint[]
  metrics: PortfolioMetrics
  benchmarkData?: PortfolioDataPoint[]
}

export abstract class BaseChart {
  protected config: ChartConfig
  protected data: any[]
  protected container: string | HTMLElement

  constructor(container: string | HTMLElement, config: Partial<ChartConfig> = {}) {
    this.container = container
    this.config = this.mergeDefaultConfig(config)
    this.data = []
  }

  protected mergeDefaultConfig(config: Partial<ChartConfig>): ChartConfig {
    return {
      title: '',
      height: 400,
      theme: 'light',
      showGrid: true,
      showLegend: true,
      responsive: true,
      animations: {
        enabled: true,
        speed: 800
      },
      ...config
    }
  }

  abstract render(): void
  abstract updateData(data: any[]): void
  abstract destroy(): void
  abstract setTheme(theme: 'light' | 'dark'): void
}

export interface ChartEventHandlers {
  onDataPointClick?: (dataPoint: PortfolioDataPoint) => void
  onPeriodChange?: (period: ChartPeriod) => void
  onMetricHover?: (metric: keyof PortfolioMetrics) => void
} 