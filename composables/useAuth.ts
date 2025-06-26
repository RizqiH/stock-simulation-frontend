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

export const useAuth = () => {
  const { auth, user: userApi } = useApi()
  const token = useCookie('auth-token')
  const user = globalUser
  const isLoading = globalIsLoading

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Initialize user data if token exists
  const initialize = async () => {
    if (token.value && !user.value) {
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
        console.error('Failed to initialize user:', error)
        token.value = null
      } finally {
        isLoading.value = false
      }
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      console.log('🔍 useAuth: Calling auth.login...')
      
      // Create credentials object with email and password
      const credentials = {
        email: email,
        password: password
      }
      
      const result = await auth.login(credentials)
      
      console.log('🔍 useAuth: Full result:', result)
      console.log('🔍 useAuth: result.data:', result.data)
      console.log('🔍 useAuth: result.error:', result.error)
      console.log('🔍 useAuth: result.data?.user:', result.data?.user)
      
      // Check if login was successful
      if (result.data?.user) {
        console.log('✅ useAuth: User data found in result.data.user')
        // Backend returned user data directly
        user.value = result.data.user
        return { success: true }
      } else if (result.data && !result.error) {
        console.log('✅ useAuth: Login successful, but no user data. Fetching profile...')
        // Login successful but no user data returned
        // Fetch user profile separately
        try {
          const profileResult = await userApi.getProfile()
          console.log('🔍 useAuth: Profile result:', profileResult)
          if (profileResult.data?.profile) {
            console.log('✅ useAuth: Profile data found, setting user...')
            user.value = profileResult.data.profile
            return { success: true }
          } else {
            console.log('❌ useAuth: No profile data found')
            return { success: false, error: 'Failed to fetch user profile after login' }
          }
        } catch (profileError) {
          console.error('💥 useAuth: Failed to fetch profile after login:', profileError)
          return { success: false, error: 'Failed to fetch user profile after login' }
        }
      } else {
        console.log('❌ useAuth: Login failed or error occurred')
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error: any) {
      console.error('💥 useAuth: Login error:', error)
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
      console.error('Failed to refresh profile:', error)
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
    initialize,
    login,
    register,
    logout,
    refreshProfile,
    requireAuth
  }
} 