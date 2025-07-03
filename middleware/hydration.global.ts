// Global middleware to ensure consistent state during hydration
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side during initial hydration
  if (process.client) {
    // Check if this is the initial page load (hydration)
    const nuxtApp = useNuxtApp()
    
    // Ensure state is consistent during hydration
    if (nuxtApp.isHydrating) {
      // Initialize auth state properly during hydration
      const { initialize, isHydrated } = useAuth()
      
      // Only initialize if not already hydrated
      if (!isHydrated.value) {
        nextTick(async () => {
          try {
            await initialize()
          } catch (error) {
            console.error('Auth initialization failed during hydration:', error)
          }
        })
      }
    }
  }
}) 