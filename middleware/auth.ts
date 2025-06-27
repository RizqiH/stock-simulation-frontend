import { debug } from '~/utils/debug'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, initialize, user } = useAuth()
  
  debug.log('auth', `Checking authentication for ${to.path}`, {
    isAuthenticated: isAuthenticated.value,
    hasUser: !!user.value
  })
  
  // Initialize auth state and wait for it to complete
  await initialize()
  
  debug.log('auth', 'Auth initialization complete', {
    isAuthenticated: isAuthenticated.value,
    hasUser: !!user.value
  })
  
  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    debug.warn('auth', 'Not authenticated, redirecting to login')
    return navigateTo('/login')
  }
  
  debug.log('auth', 'Authentication successful, allowing access')
}) 