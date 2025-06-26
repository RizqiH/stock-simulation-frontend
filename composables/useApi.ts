interface ApiResponse<T> {
  data?: T
  error?: string
}

interface User {
  id: number
  username: string
  email: string
  balance: number
  total_profit: number
  rank?: number
}

interface Stock {
  id: number
  symbol: string
  name: string
  current_price: number
  previous_close: number
  volume: number
  market_cap: number
  updated_at: string
}

interface StockPrice {
  symbol: string
  price: number
  change: number
  change_pct: number
  updated_at: string
}

interface PortfolioItem {
  stock_symbol: string
  stock_name: string
  quantity: number
  average_price: number
  current_price: number
  total_cost: number
  current_value: number
  profit_loss: number
  profit_loss_pct: number
}

interface PortfolioSummary {
  total_value: number
  total_cost: number
  total_profit: number
  total_profit_pct: number
  holdings: PortfolioItem[]
}

interface Transaction {
  id: number
  user_id: number
  stock_symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total_amount: number
  created_at: string
}

interface TransactionRequest {
  stock_symbol: string
  quantity: number
  price?: number
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://localhost:8082/api/v1'

  // Auth token management
  const token = useCookie('auth-token')
  
  const headers = computed(() => ({
    'Content-Type': 'application/json',
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
  }))

  // Generic API call function
  const apiCall = async <T>(endpoint: string, options: any = {}): Promise<ApiResponse<T>> => {
    const fullUrl = `${baseURL}${endpoint}`
    console.log(`🔍 [apiCall] Making request to: ${fullUrl}`)
    console.log(`🔍 [apiCall] Headers:`, headers.value)
    console.log(`🔍 [apiCall] Options:`, options)
    
    try {
      const response = await $fetch<T>(fullUrl, {
        headers: headers.value,
        ...options
      })
      console.log(`✅ [apiCall] Response received:`, response)
      return { data: response }
    } catch (error: any) {
      console.error('❌ [apiCall] Error occurred:', error)
      console.error('❌ [apiCall] Error data:', error.data)
      console.error('❌ [apiCall] Error status:', error.status)
      console.error('❌ [apiCall] Error statusText:', error.statusText)
      return { error: error.data?.error || error.message || 'An error occurred' }
    }
  }

  // Authentication API
  const auth = {
    async register(userData: { username: string; email: string; password: string }) {
      return apiCall<{ user: User }>('/auth/register', {
        method: 'POST',
        body: userData
      })
    },

    async login(credentials: { email: string; password: string }) {
      console.log('🔍 useApi: Calling login API with credentials:', credentials.email)
      const result = await apiCall<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password
        }
      })
      
      console.log('🔍 useApi: Raw API result:', result)
      console.log('🔍 useApi: result.data:', result.data)
      console.log('🔍 useApi: result.error:', result.error)
      
      if (result.data?.token) {
        console.log('✅ useApi: Token found, setting token...')
        console.log('🔍 useApi: Token:', result.data.token)
        token.value = result.data.token
      } else {
        console.log('❌ useApi: No token found in response')
      }
      
      return result
    },

    logout() {
      token.value = null
      navigateTo('/login')
    }
  }

  // User API
  const user = {
    async getProfile() {
      return apiCall<{ profile: User }>('/profile')
    },

    async updateProfile(profileData: Partial<User>) {
      return apiCall<{ message: string }>('/profile', {
        method: 'PUT',
        body: profileData
      })
    },

    async getLeaderboard(limit: number = 10) {
      return apiCall<{ leaderboard: User[] }>(`/leaderboard?limit=${limit}`)
    }
  }

  // Stocks API
  const stocks = {
    async getAll() {
      return apiCall<{ stocks: Stock[] }>('/stocks')
    },

    async getTop(limit: number = 10) {
      return apiCall<{ stocks: Stock[] }>(`/stocks/top?limit=${limit}`)
    },

    async getBySymbol(symbol: string) {
      return apiCall<{ stock: Stock }>(`/stocks/${symbol}`)
    }
  }

  // Portfolio API
  const portfolio = {
    async get() {
      return apiCall<{ portfolio: PortfolioItem[] }>('/portfolio')
    },

    async getSummary() {
      return apiCall<PortfolioSummary>('/portfolio/summary')
    },

    async getValue() {
      return apiCall<{ total_value: number }>('/portfolio/value')
    },

    async getPerformance(period: string = '1M') {
      return apiCall<{
        data: any[]
        period: string
        start_date: string
        end_date: string
      }>(`/portfolio/performance?period=${period}`)
    }
  }

  // Transactions API
  const transactions = {
    async buy(request: TransactionRequest) {
      return apiCall<any>('/transactions/buy', {
        method: 'POST',
        body: request
      })
    },

    async sell(request: TransactionRequest) {
      return apiCall<any>('/transactions/sell', {
        method: 'POST',
        body: request
      })
    },

    async getHistory(limit: number = 50, offset: number = 0) {
      return apiCall<{ transactions: Transaction[] }>(`/transactions?limit=${limit}&offset=${offset}`)
    },

    async getTransactions() {
      return apiCall<{ transactions: Transaction[] }>('/transactions')
    },

    async getStats() {
      return apiCall<{ stats: any }>('/transactions/stats')
    },

    async downloadReceipt(transactionId: string | number) {
      return apiCall<Blob>(`/transactions/${transactionId}/receipt`, {
        method: 'GET'
      })
    },

    async exportTransactions(filters: {
      type?: string | null
      period?: string | null
      status?: string | null
      search?: string | null
    }) {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.period) params.append('period', filters.period)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      
      return apiCall<Blob>(`/transactions/export?${params.toString()}`, {
        method: 'GET'
      })
    }
  }

  // Charts API
  const charts = {
    async getChartData(symbol: string, period: string = '30D') {
      console.log(`🔍 [useApi] Getting chart data for ${symbol}, period: ${period}`)
      console.log(`🔍 [useApi] Full URL: ${baseURL}/charts/${symbol}?period=${period}`)
      const result = await apiCall<any>(`/charts/${symbol}?period=${period}`)
      console.log(`🔍 [useApi] Chart data result:`, result)
      return result
    },

    async getHistoricalPrices(symbol: string, limit: number = 30) {
      console.log(`🔍 [useApi] Getting historical prices for ${symbol}, limit: ${limit}`)
      return apiCall<any>(`/charts/${symbol}/history?limit=${limit}`)
    },

    async getAvailableSymbols() {
      console.log(`🔍 [useApi] Getting available symbols`)
      // Add cache busting
      const timestamp = Date.now()
      const result = await apiCall<{ symbols: string[] }>(`/charts/symbols?_t=${timestamp}`)
      console.log(`🔍 [useApi] Available symbols result:`, result)
      return result
    }
  }

  return {
    apiCall,
    auth,
    user,
    stocks,
    portfolio,
    transactions,
    charts
  }
} 