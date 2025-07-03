// Global middleware to ensure consistent state during hydration
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side during hydration
  if (process.client && window.__NUXT__) {
    // Ensure auth state is consistent
    const { initialize } = useAuth()
    
    // Initialize auth state without triggering reactivity during hydration
    nextTick(() => {
      initialize()
    })
  }
}) 