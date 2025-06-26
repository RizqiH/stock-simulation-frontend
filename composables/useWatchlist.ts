interface WatchlistItem {
  symbol: string
  name: string
  current_price: number
  previous_close: number
  change: number
  change_pct: number
  added_at: string
}

// Global watchlist state
const watchlist = ref<WatchlistItem[]>([])
const isLoading = ref(false)

export const useWatchlist = () => {
  const { stocks } = useApi()
  const { success, error: notifyError } = useNotifications()

  // Load watchlist from localStorage
  const loadWatchlist = () => {
    if (process.client) {
      const saved = localStorage.getItem('stocksim-watchlist')
      if (saved) {
        try {
          watchlist.value = JSON.parse(saved)
        } catch (error) {
          console.error('Failed to parse watchlist from localStorage:', error)
        }
      }
    }
  }

  // Save watchlist to localStorage
  const saveWatchlist = () => {
    if (process.client) {
      localStorage.setItem('stocksim-watchlist', JSON.stringify(watchlist.value))
    }
  }

  // Add stock to watchlist
  const addToWatchlist = async (symbol: string) => {
    try {
      isLoading.value = true
      
      // Check if already in watchlist
      if (watchlist.value.some(item => item.symbol === symbol)) {
        notifyError('Already in Watchlist', `${symbol} is already in your watchlist`)
        return false
      }
      
      // Fetch stock data
      const result = await stocks.getBySymbol(symbol)
      if (result.data?.stock) {
        const stock = result.data.stock
        const watchlistItem: WatchlistItem = {
          symbol: stock.symbol,
          name: stock.name,
          current_price: stock.current_price,
          previous_close: stock.previous_close,
          change: stock.current_price - stock.previous_close,
          change_pct: ((stock.current_price - stock.previous_close) / stock.previous_close) * 100,
          added_at: new Date().toISOString()
        }
        
        watchlist.value.push(watchlistItem)
        saveWatchlist()
        
        success('Added to Watchlist', `${symbol} has been added to your watchlist`)
        return true
      } else {
        notifyError('Stock Not Found', `Could not find stock with symbol ${symbol}`)
        return false
      }
    } catch (error: any) {
      notifyError('Failed to Add', error.message || 'Could not add stock to watchlist')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Remove stock from watchlist
  const removeFromWatchlist = (symbol: string) => {
    const index = watchlist.value.findIndex(item => item.symbol === symbol)
    if (index > -1) {
      watchlist.value.splice(index, 1)
      saveWatchlist()
      success('Removed from Watchlist', `${symbol} has been removed from your watchlist`)
      return true
    }
    return false
  }

  // Check if stock is in watchlist
  const isInWatchlist = (symbol: string) => {
    return watchlist.value.some(item => item.symbol === symbol)
  }

  // Update watchlist prices
  const updateWatchlistPrices = async () => {
    if (watchlist.value.length === 0) return
    
    try {
      isLoading.value = true
      
      // Update each stock in watchlist
      for (const item of watchlist.value) {
        const result = await stocks.getBySymbol(item.symbol)
        if (result.data?.stock) {
          const stock = result.data.stock
          item.current_price = stock.current_price
          item.previous_close = stock.previous_close
          item.change = stock.current_price - stock.previous_close
          item.change_pct = ((stock.current_price - stock.previous_close) / stock.previous_close) * 100
        }
      }
      
      saveWatchlist()
    } catch (error: any) {
      console.error('Failed to update watchlist prices:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Clear watchlist
  const clearWatchlist = () => {
    watchlist.value = []
    saveWatchlist()
    success('Watchlist Cleared', 'Your watchlist has been cleared')
  }

  // Get watchlist summary
  const watchlistSummary = computed(() => {
    const total = watchlist.value.length
    const gainers = watchlist.value.filter(item => item.change > 0).length
    const losers = watchlist.value.filter(item => item.change < 0).length
    const unchanged = total - gainers - losers
    
    return {
      total,
      gainers,
      losers,
      unchanged
    }
  })

  // Initialize watchlist on first use
  if (process.client && watchlist.value.length === 0) {
    loadWatchlist()
  }

  return {
    watchlist: readonly(watchlist),
    isLoading: readonly(isLoading),
    watchlistSummary,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    updateWatchlistPrices,
    clearWatchlist,
    loadWatchlist,
    saveWatchlist
  }
} 