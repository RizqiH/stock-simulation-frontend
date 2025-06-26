interface RealtimeOptions {
  enabled?: boolean
  interval?: number
  maxRetries?: number
}

export const useRealTime = (fetchFunction: () => Promise<any>, options: RealtimeOptions = {}) => {
  const { 
    enabled = true, 
    interval = 30000, // 30 seconds default
    maxRetries = 3 
  } = options
  
  const isRunning = ref(false)
  const lastUpdate = ref<Date | null>(null)
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  
  let intervalId: NodeJS.Timeout | null = null
  
  const start = () => {
    if (!enabled || isRunning.value) return
    
    isRunning.value = true
    error.value = null
    retryCount.value = 0
    
    const runUpdate = async () => {
      try {
        await fetchFunction()
        lastUpdate.value = new Date()
        retryCount.value = 0
        error.value = null
      } catch (err: any) {
        retryCount.value++
        error.value = err.message || 'Failed to fetch real-time data'
        
        if (retryCount.value >= maxRetries) {
          stop()
          console.error('Real-time updates stopped after max retries')
        }
      }
    }
    
    // Initial fetch
    runUpdate()
    
    // Set up interval
    intervalId = setInterval(runUpdate, interval)
  }
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }
  
  const restart = () => {
    stop()
    start()
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })
  
  return {
    isRunning: readonly(isRunning),
    lastUpdate: readonly(lastUpdate),
    error: readonly(error),
    retryCount: readonly(retryCount),
    start,
    stop,
    restart
  }
} 