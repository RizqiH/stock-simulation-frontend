<template>
  <div class="notification-container">
    <Teleport to="body">
      <Transition name="notifications-container">
        <div 
          v-if="notifications.length > 0"
          class="fixed inset-x-0 top-18 z-[60] pointer-events-none lg:top-20"
        >
          <div class="flex flex-col items-center space-y-2 p-4 lg:items-end lg:pr-6">
            <TransitionGroup name="notification" tag="div" class="flex flex-col space-y-2">
              <div
                v-for="notification in visibleNotifications"
                :key="notification.id"
                class="notification-item pointer-events-auto w-full max-w-sm lg:w-96"
              >
                <!-- Unified Layout for both mobile and desktop -->
                <div 
                  class="flex items-start gap-3 p-3 lg:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4"
                  :class="getBorderColorClass(notification.type)"
                >
                  <div class="flex-shrink-0 mt-0.5">
                    <UIcon 
                      :name="notification.icon || getDefaultIcon(notification.type)"
                      class="w-5 h-5 lg:w-6 lg:h-6"
                      :class="getIconColorClass(notification.type)"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm lg:text-base font-semibold text-gray-900 dark:text-white leading-tight">
                      {{ notification.title }}
                    </h4>
                    <p 
                      v-if="notification.message" 
                      class="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1"
                    >
                      {{ notification.message }}
                    </p>
                    <!-- Actions -->
                    <div v-if="notification.actions && notification.actions.length > 0" class="flex gap-2 mt-2 lg:mt-3">
                      <UButton
                        v-for="(action, index) in notification.actions.slice(0, isMobile ? 2 : notification.actions.length)"
                        :key="action.label"
                        @click="() => { action.action(); removeNotification(notification.id) }"
                        :variant="action.style === 'primary' ? 'solid' : 'outline'"
                        :color="action.style === 'danger' ? 'red' : 'primary'"
                        size="2xs"
                        class="text-xs lg:text-sm"
                      >
                        {{ action.label }}
                      </UButton>
                    </div>
                  </div>
                  <UButton
                    @click="removeNotification(notification.id)"
                    variant="ghost"
                    size="2xs"
                    icon="i-heroicons-x-mark"
                    class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:size-xs"
                  />
                </div>

                <!-- Progress Bar (if enabled) -->
                <div 
                  v-if="notification.progress && notification.timeout"
                  class="h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden"
                >
                  <div 
                    class="h-full bg-current transition-all duration-100 ease-linear"
                    :class="getProgressColorClass(notification.type)"
                    :style="{ width: getProgressWidth(notification) + '%' }"
                  />
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { useNotifications } from '~/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

// Reactive screen size detection
const isMobile = ref(false)

// Check screen size on client side
onMounted(() => {
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 1024
  }
  
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
})

// Limit visible notifications on mobile
const visibleNotifications = computed(() => {
  const maxVisible = isMobile.value ? 3 : 5
  return notifications.value.slice(0, maxVisible)
})

// Get notification styling classes
const getBorderColorClass = (type) => {
  const colors = {
    success: 'border-l-emerald-500 border-emerald-200 dark:border-emerald-700',
    error: 'border-l-red-500 border-red-200 dark:border-red-700',
    warning: 'border-l-amber-500 border-amber-200 dark:border-amber-700',
    info: 'border-l-primary-500 border-primary-200 dark:border-primary-700'
  }
  return colors[type] || colors.info
}

const getIconColorClass = (type) => {
  const colors = {
    success: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-primary-600 dark:text-primary-400'
  }
  return colors[type] || colors.info
}

const getProgressColorClass = (type) => {
  const colors = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-primary-600'
  }
  return colors[type] || colors.info
}

const getDefaultIcon = (type) => {
  const icons = {
    success: 'i-heroicons-check-circle',
    error: 'i-heroicons-x-circle',
    warning: 'i-heroicons-exclamation-triangle',
    info: 'i-heroicons-information-circle'
  }
  return icons[type] || icons.info
}

const getProgressWidth = (notification) => {
  if (!notification.timestamp || !notification.timeout) return 100
  
  const elapsed = Date.now() - notification.timestamp.getTime()
  const progress = Math.max(0, 100 - (elapsed / notification.timeout) * 100)
  return progress
}

// Update progress bars
const progressInterval = ref(null)

onMounted(() => {
  progressInterval.value = setInterval(() => {
    // Force reactivity update for progress bars
    notifications.value.forEach(notification => {
      if (notification.progress && notification.timeout) {
        const elapsed = Date.now() - notification.timestamp.getTime()
        if (elapsed >= notification.timeout) {
          removeNotification(notification.id)
        }
      }
    })
  }, 100)
})

onUnmounted(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
})
</script>

<style scoped>
.notification-container {
  position: relative;
  z-index: 9999;
}

/* Notification animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-move {
  transition: transform 0.3s ease;
}

.notifications-container-enter-active,
.notifications-container-leave-active {
  transition: all 0.3s ease;
}

.notifications-container-enter-from,
.notifications-container-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Safe area handling for mobile */
@supports (top: env(safe-area-inset-top)) {
  .notification-container .fixed.top-0 {
    top: env(safe-area-inset-top);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .notification-item {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}
</style> 