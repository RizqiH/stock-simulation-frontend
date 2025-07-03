import { debug } from '~/utils/debug'

interface User {
  id: number
  username: string
  email: string
  balance: number
  total_profit: number
  rank?: number
}

// Global state to ensure state is shared across all instances
const globalUser = ref<User | null>(null)
const globalIsLoading = ref(false)
const globalIsHydrated = ref(false)

export const useAuth = () => {
  const { auth, user: userApi } = useApi()
  const token = useCookie('auth-token')
  const user = globalUser
  const isLoading = globalIsLoading
  const isHydrated = globalIsHydrated

  // Safe computed for SSR
  const isAuthenticated = computed(() => {
    // During SSR, only check token existence
    if (!process.client) {
      return !!token.value
    }
    
    // On client, check both token and user after hydration
    return !!token.value && !!user.value
  })

  // Initialize user data if token exists
  const initialize = async () => {
    // Skip during SSR
    if (!process.client) return
    
    if (token.value && !user.value && !isLoading.value) {
      isLoading.value = true
      try {
        const result = await userApi.getProfile()
        if (result.data?.profile) {
          user.value = result.data.profile
        } else {
          // Token invalid, clear it
          token.value = null
        }
      } catch (error) {
        debug.error('auth', 'Failed to initialize user:', error)
        token.value = null
      } finally {
        isLoading.value = false
        isHydrated.value = true
      }
    } else if (!token.value) {
      isHydrated.value = true
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      debug.log('auth', 'Attempting login')
      
      // Create credentials object with email and password
      const credentials = {
        email: email,
        password: password
      }
      
      const result = await auth.login(credentials)
      
      debug.log('auth', 'Login response received', {
        hasUser: !!result.data?.user,
        hasData: !!result.data,
        hasError: !!result.error
      })
      
      // Check if login was successful
      if (result.data?.user) {
        debug.log('auth', 'User data found in login response')
        // Backend returned user data directly
        user.value = result.data.user
        return { success: true }
      } else if (result.data && !result.error) {
        debug.log('auth', 'Login successful, fetching user profile')
        // Login successful but no user data returned
        // Fetch user profile separately
        try {
          const profileResult = await userApi.getProfile()
          if (profileResult.data?.profile) {
            debug.log('auth', 'Profile data retrieved successfully')
            user.value = profileResult.data.profile
            return { success: true }
          } else {
            debug.warn('auth', 'No profile data found after login')
            return { success: false, error: 'Failed to fetch user profile after login' }
          }
        } catch (profileError) {
          debug.error('auth', 'Failed to fetch profile after login:', profileError)
          return { success: false, error: 'Failed to fetch user profile after login' }
        }
      } else {
        debug.warn('auth', 'Login failed', { error: result.error })
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error: any) {
      debug.error('auth', 'Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  // Register function
  const register = async (userData: { username: string; email: string; password: string }) => {
    isLoading.value = true
    try {
      const result = await auth.register(userData)
      if (result.data?.user) {
        // Auto login after registration
        const loginResult = await login(userData.email, userData.password)
        return loginResult
      } else {
        return { success: false, error: result.error || 'Registration failed' }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = () => {
    auth.logout()
    user.value = null
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (!token.value) return
    
    try {
      const result = await userApi.getProfile()
      if (result.data?.profile) {
        user.value = result.data.profile
      }
    } catch (error) {
      debug.error('auth', 'Failed to refresh profile:', error)
    }
  }

  // Middleware function for protected routes
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      navigateTo('/login')
      return false
    }
    return true
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    isHydrated,
    initialize,
    login,
    register,
    logout,
    refreshProfile,
    requireAuth
  }
} 