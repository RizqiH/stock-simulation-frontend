<template>
  <UContainer>
    <!-- Modern Page Header -->
    <section class="py-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-squares-plus" class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Advanced Orders
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Manage your advanced trading orders with limit, stop-loss, take-profit, and more
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <UButton
            @click="refreshActiveOrders"
            :loading="loading"
            variant="outline"
            icon="i-heroicons-arrow-path"
            :disabled="loading"
          >
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Orders</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ activeOrders?.length || 0 }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">Currently pending</p>
        </UCard>

        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-emerald-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Executed Today</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ orderStatistics?.executed_orders || 0 }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">Orders filled</p>
        </UCard>

        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Success Rate</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ formatPercentage(orderStatistics?.success_rate || 0) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">Execution rate</p>
        </UCard>

        <UCard class="p-6 text-center hover:scale-105 transition-all duration-300 group">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Commission Paid</h3>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${{ formatNumber(totalCommissionPaid) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">Total fees</p>
        </UCard>
      </div>
    </section>

    <!-- Main Content Tabs -->
    <section class="pb-16">
      <UCard>
        <template #header>
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex items-center gap-6 overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
                  activeTab === tab.id 
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                ]"
              >
                <UIcon :name="tab.icon" class="w-4 h-4" />
                {{ tab.label }}
              </button>
            </div>
          </div>
        </template>

        <!-- Create Order Tab -->
        <div v-if="activeTab === 'create'">
          <AdvancedOrderForm
            :preselected-symbol="preselectedSymbol"
            @order-created="handleOrderCreated"
            @oco-created="handleOCOCreated"
          />
        </div>

        <!-- Active Orders Tab -->
        <div v-if="activeTab === 'active'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Active Orders</h2>
            <UButton
              @click="refreshActiveOrders"
              variant="outline"
              :loading="loading"
              icon="i-heroicons-arrow-path"
              :disabled="loading"
            >
              {{ loading ? 'Refreshing...' : 'Refresh' }}
            </UButton>
          </div>

          <div v-if="loading" class="text-center py-8">
            <div class="flex items-center justify-center gap-3">
              <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-gray-600 dark:text-gray-400">Loading orders...</p>
            </div>
          </div>
          
          <div v-else-if="!activeOrders || activeOrders.length === 0" class="text-center py-16">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-clock" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Orders</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              You don't have any active orders at the moment
            </p>
            <UButton to="/market" icon="i-heroicons-plus">
              Create Your First Order
            </UButton>
          </div>

          <div v-else class="space-y-4">
            <UCard v-for="order in (activeOrders || [])" :key="order.id" class="p-4 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <UAvatar
                    :text="(order.stock_symbol || 'S').charAt(0)"
                    size="sm"
                    class="bg-gradient-to-br from-primary-500 to-purple-600"
                  />
                  <div>
                    <h4 class="font-bold text-gray-900 dark:text-white">{{ order.stock_symbol }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ order.order_type }} • {{ order.side }} • {{ order.quantity }} shares
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <UBadge :color="(getOrderStatusColor(order.status) as any)" variant="soft">
                    {{ order.status }}
                  </UBadge>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${{ order.price?.toFixed(2) || 'Market' }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Order History Tab -->
        <div v-if="activeTab === 'history'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
          </div>

          <div class="text-center py-16">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order History</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Detailed order history with filters coming soon
            </p>
            <UButton to="/transactions" variant="outline">
              View Transaction History
            </UButton>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Order Analytics</h2>
          </div>

          <div class="text-center py-16">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order Analytics</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Advanced analytics and performance metrics coming soon
            </p>
            <div v-if="orderStatistics" class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <UCard class="p-4 text-center">
                <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ orderStatistics.total_orders || 0 }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              </UCard>
              <UCard class="p-4 text-center">
                <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ orderStatistics.executed_orders || 0 }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Executed</p>
              </UCard>
              <UCard class="p-4 text-center">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ orderStatistics.pending_orders || 0 }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </UCard>
              <UCard class="p-4 text-center">
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ formatPercentage(orderStatistics.success_rate || 0) }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              </UCard>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Order Details Modal -->
    <UModal v-model="showOrderDetailsModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h3>
        </template>
        <div v-if="selectedOrder" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Symbol</label>
            <p class="font-semibold text-gray-900 dark:text-white">{{ selectedOrder.stock_symbol }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
            <p class="text-gray-900 dark:text-white">{{ selectedOrder.order_type }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
            <UBadge :color="(getOrderStatusColor(selectedOrder.status) as any)" variant="soft">{{ selectedOrder.status }}</UBadge>
          </div>
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton @click="showOrderDetailsModal = false" variant="outline">Close</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Real-time Notifications -->
    <div v-if="realtimeEnabled" class="fixed bottom-4 right-4 z-50">
      <div class="bg-emerald-500 text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="text-sm font-medium">Live Updates</span>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdvancedOrders, type AdvancedOrder, type OrderSearchCriteria } from '~/composables/useAdvancedOrders'
import { useNotifications } from '~/composables/useNotifications'

// Composables
const {
  orders,
  activeOrders,
  orderStatistics,
  executionMetrics,
  loading,
  error,
  totalCommissionPaid,
  fetchOrders,
  refreshActiveOrders,
  fetchOrderStatistics,
  fetchExecutionMetrics,
  cancelOrder,
  cancelAllOrders,
  modifyOrder,
  fetchOrderById,
  getOrderStatusColor,
  init
} = useAdvancedOrders()

const { success: showNotification } = useNotifications()

// Page state
const activeTab = ref('create')
const selectedOrder = ref<AdvancedOrder | null>(null)
const showOrderDetailsModal = ref(false)
const showModifyOrderModal = ref(false)
const showCancelAllModal = ref(false)
const orderFilters = ref<OrderSearchCriteria>({})
const realtimeEnabled = ref(true)

// URL parameters
const route = useRoute()
const preselectedSymbol = computed(() => route.query.symbol as string)

// Tab configuration
const tabs = [
  { id: 'create', label: 'Create Order', icon: 'heroicons:plus-circle' },
  { id: 'active', label: 'Active Orders', icon: 'heroicons:clock' },
  { id: 'history', label: 'Order History', icon: 'heroicons:document-text' },
  { id: 'analytics', label: 'Analytics', icon: 'heroicons:chart-bar' }
]

// Computed
const pendingOrdersCount = computed(() => 
  activeOrders.value.filter(order => order.status === 'PENDING').length
)

const partiallyFilledCount = computed(() => 
  activeOrders.value.filter(order => order.status === 'PARTIALLY_FILLED').length
)

// Event handlers
const handleOrderCreated = async (order: AdvancedOrder) => {
  try {
    await refreshActiveOrders()
  } catch (err) {
    console.warn('Failed to refresh active orders:', err)
  }
  
  try {
    await fetchOrderStatistics()
  } catch (err) {
    console.warn('Failed to fetch order statistics:', err)
  }
  
  // Only switch to active tab if order is pending (like limit orders)
  // Market orders for selling are executed immediately, so stay on create tab
  if (order && order.status === 'PENDING') {
    activeTab.value = 'active'
  }
  // For executed orders (like market sells), stay on create tab for better UX
  
  // Force page refresh to update balance and portfolio in real-time
  try {
    await refreshPage()
  } catch (err) {
    console.warn('Failed to refresh page:', err)
    // Fallback: just reload the current page
    window.location.reload()
  }
}

const handleOCOCreated = async (orders: { parentOrder: AdvancedOrder, linkedOrder: AdvancedOrder }) => {
  await refreshActiveOrders()
  await fetchOrderStatistics()
  
  // OCO orders are typically pending, so switch to active tab
  activeTab.value = 'active'
}

const handleModifyOrder = (order: AdvancedOrder) => {
  selectedOrder.value = order
  showModifyOrderModal.value = true
}

const handleCancelOrder = async (order: AdvancedOrder) => {
  try {
    await cancelOrder(order.id)
    await refreshActiveOrders()
    await fetchOrderStatistics()
  } catch (error) {
    console.error('Failed to cancel order:', error)
  }
}

const handleViewOrderDetails = async (order: AdvancedOrder) => {
  try {
    // Fetch the latest order details
    selectedOrder.value = await fetchOrderById(order.id)
    showOrderDetailsModal.value = true
  } catch (error) {
    console.error('Failed to fetch order details:', error)
    selectedOrder.value = order
    showOrderDetailsModal.value = true
  }
}

const handleOrderModification = async (modifications: any) => {
  if (!selectedOrder.value) return

  try {
    await modifyOrder(selectedOrder.value.id, modifications)
    showModifyOrderModal.value = false
    selectedOrder.value = null
    await refreshActiveOrders()
  } catch (error) {
    console.error('Failed to modify order:', error)
  }
}

const handleCancelAllOrders = async () => {
  try {
    const cancelledCount = await cancelAllOrders()
    showNotification(`Cancelled ${cancelledCount} orders`, 'success')
    showCancelAllModal.value = false
    await refreshActiveOrders()
    await fetchOrderStatistics()
  } catch (error) {
    console.error('Failed to cancel all orders:', error)
  }
}

const applyFilters = async () => {
  try {
    await fetchOrders(orderFilters.value)
  } catch (error) {
    console.error('Failed to apply filters:', error)
  }
}

const refreshPage = async () => {
  // Refresh the page to update balance and portfolio
  await navigateTo('/advanced-orders', { replace: true })
}

const resetFilters = async () => {
  orderFilters.value = {}
  try {
    await fetchOrders()
  } catch (error) {
    console.error('Failed to reset filters:', error)
  }
}

const handleTimeframeChanged = async (timeframe: string) => {
  try {
    await fetchExecutionMetrics(timeframe)
  } catch (error) {
    console.error('Failed to fetch execution metrics:', error)
  }
}

const handleSymbolSelected = (symbol: string) => {
  orderFilters.value.symbol = symbol
  applyFilters()
}

const loadMoreHistory = async () => {
  // Implement pagination
  const currentOffset = orderFilters.value.offset || 0
  const limit = orderFilters.value.limit || 20
  
  orderFilters.value.offset = currentOffset + limit
  await fetchOrders(orderFilters.value)
}

// Utility functions
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100)
}

// Lifecycle
onMounted(() => {
  init()
  fetchOrderStatistics()
  fetchExecutionMetrics()
  
  // Check for URL parameters
  if (route.query.symbol) {
    // Switch to create tab if symbol is provided
    activeTab.value = 'create'
  }
})

// SEO
useHead({
  title: 'Advanced Orders - StockSim Pro',
  meta: [
    {
      name: 'description',
      content: 'Manage your advanced trading orders with limit, stop-loss, take-profit, trailing stops and OCO orders. Professional order management tools.'
    }
  ]
})

// Middleware
definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
/* Component-specific styles */
</style> 