export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
  
  // Check if user has admin role (assuming role property exists)
  if (user.value?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied: Admin privileges required'
    })
  }
}) 