interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
  persistent?: boolean
  icon?: string
  actions?: NotificationAction[]
  timestamp?: Date
  progress?: boolean
  sound?: boolean
}

interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

interface NotificationOptions {
  timeout?: number
  persistent?: boolean
  icon?: string
  actions?: NotificationAction[]
  progress?: boolean
  sound?: boolean
}

const notifications = ref<Notification[]>([])
const isEnabled = ref(true)
const soundEnabled = ref(true)
const maxNotifications = ref(5)

export const useNotifications = () => {
  // Play notification sound
  const playNotificationSound = (type: 'success' | 'error' | 'warning' | 'info') => {
    if (!soundEnabled.value || typeof window === 'undefined') return
    
    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different frequencies for different notification types
      const frequencies = {
        success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
        error: [440, 466.16], // A4, Bb4 (dissonant)
        warning: [554.37, 659.25], // C#5, E5
        info: [523.25, 659.25] // C5, E5
      }
      
      const freq = frequencies[type]
      let currentTime = audioContext.currentTime
      
      freq.forEach((f, i) => {
        const osc = audioContext.createOscillator()
        const gain = audioContext.createGain()
        
        osc.connect(gain)
        gain.connect(audioContext.destination)
        
        osc.frequency.setValueAtTime(f, currentTime)
        gain.gain.setValueAtTime(0.1, currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1)
        
        osc.start(currentTime)
        osc.stop(currentTime + 0.1)
        
        currentTime += 0.05
      })
    } catch (error) {
      // Only log in debug mode for notification sounds (check if we're on localhost)
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.warn('Could not play notification sound:', error)
      }
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>, options?: NotificationOptions) => {
    if (!isEnabled.value) return null

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      id,
      timestamp: new Date(),
      timeout: 5000,
      sound: true,
      ...notification,
      ...options
    }
    
    // Add to beginning of array (newest first)
    notifications.value.unshift(newNotification)
    
    // Keep only max notifications
    if (notifications.value.length > maxNotifications.value) {
      notifications.value = notifications.value.slice(0, maxNotifications.value)
    }
    
    // Play sound if enabled
    if (newNotification.sound) {
      playNotificationSound(newNotification.type)
    }
    
    // Auto remove after timeout (unless persistent)
    if (!newNotification.persistent && newNotification.timeout) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.timeout)
    }
    
    return id
  }
  
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const removeAllNotifications = () => {
    notifications.value = []
  }
  
  const clearAll = () => {
    notifications.value = []
  }

  // Enhanced shorthand methods with better defaults
  const success = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification({ 
      type: 'success', 
      title, 
      message,
      icon: 'i-heroicons-check-circle',
      timeout: 4000
    }, options)
  }
  
  const error = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message,
      icon: 'i-heroicons-x-circle',
      timeout: 6000,
      persistent: false
    }, options)
  }
  
  const warning = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification({ 
      type: 'warning', 
      title, 
      message,
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 5000
    }, options)
  }
  
  const info = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification({ 
      type: 'info', 
      title, 
      message,
      icon: 'i-heroicons-information-circle',
      timeout: 4000
    }, options)
  }

  // Specialized trading notifications
  const orderSuccess = (orderType: string, symbol: string, quantity: number) => {
    return success(
      `${orderType} Order Placed`,
      `${quantity} shares of ${symbol}`,
      {
        timeout: 4000,
        actions: [
          {
            label: 'View Order',
            action: () => navigateTo('/advanced-orders?tab=active'),
            style: 'primary'
          }
        ]
      }
    )
  }

  const orderError = (orderType: string, symbol: string, reason: string) => {
    return error(
      `${orderType} Order Failed`,
      `${symbol}: ${reason}`,
      {
        timeout: 8000,
        actions: [
          {
            label: 'Retry',
            action: () => {}, // Will be set by caller
            style: 'primary'
          },
          {
            label: 'Contact Support',
            action: () => navigateTo('/support'),
            style: 'secondary'
          }
        ]
      }
    )
  }

  const marketAlert = (symbol: string, message: string) => {
    return warning(
      `Market Alert: ${symbol}`,
      message,
      {
        timeout: 10000,
        persistent: true,
        actions: [
          {
            label: 'View Chart',
            action: () => navigateTo(`/stock/${symbol}`),
            style: 'primary'
          }
        ]
      }
    )
  }

  // Settings
  const toggleEnabled = () => {
    isEnabled.value = !isEnabled.value
  }

  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
  }

  const setMaxNotifications = (max: number) => {
    maxNotifications.value = Math.max(1, Math.min(20, max))
  }

  // Computed properties
  const hasNotifications = computed(() => notifications.value.length > 0)
  const unreadCount = computed(() => notifications.value.length)
  const latestNotification = computed(() => notifications.value[0])

  return {
    // State
    notifications: readonly(notifications),
    isEnabled: readonly(isEnabled),
    soundEnabled: readonly(soundEnabled),
    maxNotifications: readonly(maxNotifications),

    // Computed
    hasNotifications,
    unreadCount,
    latestNotification,

    // Core methods
    addNotification,
    removeNotification,
    removeAllNotifications,
    clearAll,

    // Convenience methods
    success,
    error,
    warning,
    info,

    // Trading-specific methods
    orderSuccess,
    orderError,
    marketAlert,

    // Settings
    toggleEnabled,
    toggleSound,
    setMaxNotifications
  }
} 