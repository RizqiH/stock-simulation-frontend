export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, initialize, user } = useAuth()
  
  console.log('🔐 Auth middleware: Checking authentication for', to.path)
  console.log('🔐 Auth middleware: Current isAuthenticated:', isAuthenticated.value)
  console.log('🔐 Auth middleware: Current user:', user.value)
  
  // Initialize auth state and wait for it to complete
  await initialize()
  
  console.log('🔐 Auth middleware: After initialize - isAuthenticated:', isAuthenticated.value)
  console.log('🔐 Auth middleware: After initialize - user:', user.value)
  
  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    console.log('🔐 Auth middleware: Not authenticated, redirecting to login')
    return navigateTo('/login')
  }
  
  console.log('🔐 Auth middleware: Authentication successful, allowing access')
}) 