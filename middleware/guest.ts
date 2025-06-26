export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
 
  // If already authenticated, redirect to dashboard
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
}) 