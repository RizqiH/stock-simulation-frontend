<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <!-- Navigation -->
      <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 safe-top">
        <UContainer>
          <div class="flex items-center justify-between h-16">
            <!-- Logo and Brand -->
            <div class="flex items-center gap-4">
              <NuxtLink to="/" class="flex items-center gap-3 font-bold text-xl text-gray-900 dark:text-white">
                <div class="w-8 h-8 bg-gradient-to-br from-primary-600 via-purple-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-white" />
                </div>
                StockSim Pro
              </NuxtLink>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex items-center gap-8">
              <NuxtLink 
                v-if="isAuthenticated"
                to="/dashboard" 
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/dashboard' }"
              >
                <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
                Dashboard
              </NuxtLink>
              <NuxtLink 
                to="/market" 
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/market' }"
              >
                <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
                Market
              </NuxtLink>
              <NuxtLink 
                v-if="isAuthenticated"
                to="/portfolio" 
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/portfolio' }"
              >
                <UIcon name="i-heroicons-briefcase" class="w-4 h-4" />
                Portfolio
              </NuxtLink>
              <NuxtLink 
                v-if="isAuthenticated"
                to="/watchlist" 
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/watchlist' }"
              >
                <UIcon name="i-heroicons-heart" class="w-4 h-4" />
                Watchlist
              </NuxtLink>

              <NuxtLink 
                v-if="isAuthenticated"
                to="/transactions" 
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/transactions' }"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                Transactions
              </NuxtLink>
              <NuxtLink 
                to="/leaderboard" 
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/leaderboard' }"
              >
                <UIcon name="i-heroicons-trophy" class="w-4 h-4" />
                Leaderboard
              </NuxtLink>
            </nav>

            <!-- Right side controls -->
            <div class="flex items-center gap-4">
              <!-- Theme Toggle -->
              <ClientOnly>
                <UButton
                  @click="toggleDark"
                  variant="ghost"
                  size="sm"
                  :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
                  class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                />
              </ClientOnly>

              <!-- Notifications -->
              <ClientOnly>
                <UPopover v-if="isAuthenticated && notifications.length > 0">
                  <UButton
                    variant="ghost"
                    size="sm"
                    icon="i-heroicons-bell"
                    :badge="notifications.length"
                    class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  />
                  
                  <template #panel>
                    <div class="p-4 w-80">
                      <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <UButton @click="clearAll" variant="ghost" size="xs">Clear All</UButton>
                      </div>
                      
                      <div class="space-y-3 max-h-64 overflow-y-auto">
                        <div 
                          v-for="notification in notifications.slice(0, 5)"
                          :key="notification.id"
                          class="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <h4 class="font-medium text-sm text-gray-900 dark:text-white">
                                {{ notification.title }}
                              </h4>
                              <p v-if="notification.message" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {{ notification.message }}
                              </p>
                            </div>
                            <UButton
                              @click="removeNotification(notification.id)"
                              variant="ghost"
                              size="xs"
                              icon="i-heroicons-x-mark"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </ClientOnly>

              <!-- User Balance (if authenticated) -->
              <ClientOnly>
                <div v-if="isAuthenticated && user?.balance" class="hidden md:block">
                  <div class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 rounded-lg">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span class="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        ${{ user.balance.toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </ClientOnly>

              <!-- User Menu (if authenticated) -->
              <ClientOnly>
                <UDropdown v-if="isAuthenticated && user" :items="userMenuItems">
                  <UButton variant="ghost" class="flex items-center gap-2">
                    <UAvatar
                      :text="user.username?.charAt(0) || 'U'"
                      size="sm"
                      class="bg-gradient-to-br from-primary-500 to-purple-600"
                    />
                    <span class="hidden md:inline text-gray-900 dark:text-white">{{ user.username }}</span>
                    <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400" />
                  </UButton>
                </UDropdown>
              </ClientOnly>

              <!-- Login/Register (if not authenticated) -->
              <ClientOnly>
                <div v-if="!isAuthenticated" class="hidden sm:flex items-center gap-2">
                  <UButton to="/login" variant="ghost" size="sm">
                    Login
                  </UButton>
                  <UButton to="/register" size="sm">
                    Register
                  </UButton>
                </div>
              </ClientOnly>

              <!-- Mobile Menu Toggle -->
              <UButton
                @click="showMobileMenu = !showMobileMenu"
                variant="ghost"
                size="sm"
                icon="i-heroicons-bars-3"
                class="lg:hidden text-gray-600 dark:text-gray-400 touch-target"
              />
            </div>
          </div>

          <!-- Mobile Navigation -->
          <ClientOnly>
            <div v-if="showMobileMenu" class="md:hidden">
              <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <NuxtLink 
                  v-if="isAuthenticated"
                  to="/dashboard" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
                  Dashboard
                </NuxtLink>
                <NuxtLink 
                  to="/market" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
                  Market
                </NuxtLink>
                <NuxtLink 
                  v-if="isAuthenticated"
                  to="/portfolio" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <UIcon name="i-heroicons-briefcase" class="w-5 h-5" />
                  Portfolio
                </NuxtLink>
                <NuxtLink 
                  v-if="isAuthenticated"
                  to="/watchlist" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <UIcon name="i-heroicons-heart" class="w-5 h-5" />
                  Watchlist
                </NuxtLink>

                <NuxtLink 
                  v-if="isAuthenticated"
                  to="/transactions" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
                  Transactions
                </NuxtLink>
                <NuxtLink 
                  to="/leaderboard" 
                  class="mobile-nav-link"
                  @click="showMobileMenu = false"
                >
                  <UIcon name="i-heroicons-trophy" class="w-5 h-5" />
                  Leaderboard
                </NuxtLink>
                
                <!-- Mobile User Balance -->
                <div v-if="isAuthenticated && user?.balance" class="mobile-nav-link border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-emerald-600" />
                  Balance: ${{ user.balance.toLocaleString() }}
                </div>
                
                <!-- Mobile Login/Register (if not authenticated) -->
                <div v-if="!isAuthenticated" class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div class="flex flex-col space-y-2 px-2">
                    <UButton 
                      to="/login" 
                      variant="ghost" 
                      size="sm" 
                      class="w-full justify-center"
                      @click="showMobileMenu = false"
                    >
                      <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
                      Login
                    </UButton>
                    <UButton 
                      to="/register" 
                      size="sm" 
                      class="w-full justify-center"
                      @click="showMobileMenu = false"
                    >
                      <UIcon name="i-heroicons-user-plus" class="w-4 h-4 mr-2" />
                      Register
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </ClientOnly>
        </UContainer>
      </header>

      <!-- Notification System -->
      <NotificationToast />

      <!-- Main Content -->
      <main class="flex-1 mt-16 sm:mt-16">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <UContainer>
          <div class="py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <!-- Brand -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-primary-600 via-purple-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-white" />
                  </div>
                  <span class="font-bold text-xl text-gray-900 dark:text-white">StockSim Pro</span>
                </div>
                <p class="text-gray-600 dark:text-gray-400">
                  Master stock trading without risk using our advanced virtual trading platform.
                </p>
                <div class="flex items-center gap-2">
                  <UBadge color="emerald" variant="soft">100% Risk-Free</UBadge>
                  <UBadge color="primary" variant="soft">v2.0</UBadge>
                </div>
              </div>

              <!-- Platform -->
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">Platform</h4>
                <div class="space-y-2">
                  <NuxtLink to="/market" class="footer-link">Live Market</NuxtLink>
                  <NuxtLink to="/leaderboard" class="footer-link">Leaderboard</NuxtLink>
                  <NuxtLink v-if="isAuthenticated" to="/portfolio" class="footer-link">Portfolio</NuxtLink>
                  <NuxtLink v-if="isAuthenticated" to="/dashboard" class="footer-link">Dashboard</NuxtLink>
                </div>
              </div>

              <!-- Resources -->
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">Resources</h4>
                <div class="space-y-2">
                  <a href="#" class="footer-link">Trading Guide</a>
                  <a href="#" class="footer-link">Market Analysis</a>
                  <a href="#" class="footer-link">Investment Tips</a>
                  <a href="#" class="footer-link">FAQ</a>
                </div>
              </div>

              <!-- Company -->
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">Company</h4>
                <div class="space-y-2">
                  <a href="#" class="footer-link">About Us</a>
                  <a href="#" class="footer-link">Contact</a>
                  <a href="#" class="footer-link">Privacy Policy</a>
                  <a href="#" class="footer-link">Terms of Service</a>
                </div>
              </div>
            </div>

            <!-- Bottom Footer -->
            <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p class="text-gray-600 dark:text-gray-400">
                © 2024 StockSim Pro. All rights reserved.
              </p>
              <div class="flex items-center gap-4">
                <p class="text-sm text-gray-500 dark:text-gray-500">Made with ❤️ for traders</p>
              </div>
            </div>
          </div>
        </UContainer>
      </footer>
    </div>
</template>

<script setup>
// Composables
const { user, isAuthenticated, logout } = useAuth()
const { notifications, removeNotification, clearAll } = useNotifications()
const { isDark, toggleDark } = useTheme()



// Reactive data
const showMobileMenu = ref(false)

// User menu items
const userMenuItems = computed(() => [
  [{
    label: 'Dashboard',
    icon: 'i-heroicons-squares-2x2',
    to: '/dashboard'
  }, {
    label: 'Profile Settings',
    icon: 'i-heroicons-user-circle',
    to: '/profile'
  }],
  [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: logout
  }]
])

// Close mobile menu when route changes
watch(() => useRoute().path, () => {
  showMobileMenu.value = false
})

// Notification helper methods
const getNotificationClass = (type) => {
  const classes = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400',
    error: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400'
  }
  return classes[type] || classes.info
}

const getIconColor = (type) => {
  const colors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500'
  }
  return colors[type] || colors.info
}

const getIconBgColor = (type) => {
  const colors = {
    success: 'bg-emerald-400',
    error: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400'
  }
  return colors[type] || colors.info
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return timestamp.toLocaleDateString()
}


</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors duration-200;
}

.nav-link-active {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20;
}

.mobile-nav-link {
  @apply flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200;
}

.footer-link {
  @apply block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200;
}

/* Enhanced Notification Styles */
.notification-card {
  @apply relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm overflow-hidden;
  animation: slideIn 0.3s ease-out;
}

.notification-card:hover {
  @apply shadow-xl transform scale-[1.02];
  transition: all 0.2s ease-out;
}

/* Notification Animation */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Progress Bar Animation */
.notification-progress {
  @apply absolute bottom-0 left-0 h-1 bg-gradient-to-r;
  width: 100%;
  animation: progress linear forwards;
}

.notification-card.bg-emerald-50 .notification-progress {
  @apply from-emerald-400 to-emerald-600;
}

.notification-card.bg-red-50 .notification-progress {
  @apply from-red-400 to-red-600;
}

.notification-card.bg-amber-50 .notification-progress {
  @apply from-amber-400 to-amber-600;
}

.notification-card.bg-blue-50 .notification-progress {
  @apply from-blue-400 to-blue-600;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dark mode adjustments */
.dark .notification-card.bg-emerald-50 {
  @apply bg-emerald-900/20 border-emerald-400/50;
}

.dark .notification-card.bg-red-50 {
  @apply bg-red-900/20 border-red-400/50;
}

.dark .notification-card.bg-amber-50 {
  @apply bg-amber-900/20 border-amber-400/50;
}

.dark .notification-card.bg-blue-50 {
  @apply bg-blue-900/20 border-blue-400/50;
}

/* Mobile layout optimizations */
@media (max-width: 360px) {
  /* Extra small mobile specific adjustments */
  .nav-link {
    @apply px-2 py-1.5 text-xs;
  }
  
  .mobile-nav-link {
    @apply px-3 py-2 text-xs;
  }
  
  /* Ensure proper spacing on very small screens */
  .min-h-screen {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
}

/* Fix for mobile viewport */
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}

/* Ensure no overlapping elements */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

