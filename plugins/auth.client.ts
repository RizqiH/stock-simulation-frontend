export default defineNuxtPlugin(async () => {
  // Initialize auth state on client side only
  const { initialize } = useAuth()
  
  try {
    await initialize()
  } catch (error) {
    console.error('Failed to initialize auth state:', error)
  }
}) 