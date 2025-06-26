<template>
  <div class="advanced-order-form">
    <!-- Header -->
    <div class="form-header">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Advanced Order</h3>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        Place sophisticated orders with advanced trading features
      </p>
    </div>

    <!-- Order Type Selection -->
    <div class="order-type-selector mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Order Type
      </label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="type in orderTypes"
          :key="type.value"
          @click="selectOrderType(type.value)"
          :class="[
            'order-type-btn',
            form.orderType === type.value ? 'order-type-active' : 'order-type-inactive'
          ]"
        >
          <UIcon :name="type.icon" class="w-5 h-5 mb-2" />
          <span class="font-medium">{{ type.label }}</span>
          <span class="text-xs opacity-75">{{ type.description }}</span>
        </button>
      </div>
    </div>

    <!-- Main Form -->
    <UForm :schema="formSchema" :state="form" @submit="handleSubmit" class="space-y-6">
      <!-- Symbol Selection -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormGroup label="Stock Symbol" name="symbol" required>
          <USelectMenu
            v-model="form.symbol"
            :options="symbolOptions"
            value-attribute="value"
            option-attribute="label"
            placeholder="Select or search symbol"
            searchable
            @change="onSymbolChange"
          />
        </UFormGroup>

        <UFormGroup label="Side" name="side" required>
          <!-- Radio Button Style Side Selection -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="option in sideOptions"
              :key="option.value"
              type="button"
              @click="selectSide(option.value)"
              :class="[
                'side-option-btn',
                form.side === option.value ? 'side-option-active' : 'side-option-inactive'
              ]"
            >
              <UIcon 
                :name="getSideIcon(option.value)" 
                :class="getSideColor(option.value)"
                class="w-4 h-4 mb-1"
              />
              <span class="text-sm font-medium">{{ option.label }}</span>
            </button>
          </div>
          
          <!-- Fallback Select Menu (hidden but keeps form validation working) -->
          <USelectMenu
            v-model="form.side"
            :options="sideOptions"
            placeholder="Buy or Sell"
            class="hidden"
            @change="onSideChange"
          />
        </UFormGroup>
      </div>

      <!-- Stock Info Card -->
      <UCard v-if="selectedStock" class="border-primary-200 dark:border-primary-700/30">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UAvatar
              :text="selectedStock.symbol?.charAt(0)"
              class="bg-gradient-to-br from-primary-500 to-purple-600"
            />
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white">{{ selectedStock.symbol }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedStock.name }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-xl text-gray-900 dark:text-white">
              ${{ selectedStock.current_price?.toFixed(2) }}
            </p>
            <UBadge
              :color="stockChange >= 0 ? 'emerald' : 'red'"
              variant="soft"
            >
              {{ stockChange >= 0 ? '+' : '' }}{{ stockChangePct.toFixed(2) }}%
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Quantity -->
      <UFormGroup label="Quantity" name="quantity" required>
        <UInput
          v-model.number="form.quantity"
          type="number"
          placeholder="Number of shares"
          min="1"
        />
      </UFormGroup>

      <!-- Price Fields (conditional based on order type) -->
      <div v-if="needsPrice" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormGroup 
          v-if="form.orderType === 'LIMIT'"
          label="Limit Price" 
          name="price" 
          required
        >
          <UInput
            v-model.number="form.price"
            type="number"
            step="0.01"
            placeholder="Price per share"
          />
        </UFormGroup>

        <UFormGroup 
          v-if="needsStopPrice"
          label="Stop Price" 
          name="stopPrice" 
          required
        >
          <UInput
            v-model.number="form.stopPrice"
            type="number"
            step="0.01"
            placeholder="Stop trigger price"
          />
        </UFormGroup>
      </div>

      <!-- Trailing Stop Fields -->
      <div v-if="form.orderType === 'TRAILING_STOP'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormGroup label="Trailing Type" name="trailingType">
          <USelectMenu
            v-model="trailingType"
            :options="trailingOptions"
            value-attribute="value"
            option-attribute="label"
            placeholder="Amount or Percentage"
          />
        </UFormGroup>

        <UFormGroup 
          :label="trailingType === 'amount' ? 'Trailing Amount ($)' : 'Trailing Percentage (%)'"
          name="trailingValue"
          required
        >
          <UInput
            v-model.number="trailingValue"
            type="number"
            :step="trailingType === 'amount' ? '0.01' : '0.1'"
            :placeholder="trailingType === 'amount' ? 'Dollar amount' : 'Percentage'"
          />
        </UFormGroup>
      </div>

      <!-- Time in Force -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormGroup label="Time in Force" name="timeInForce">
          <USelectMenu
            v-model="form.timeInForce"
            :options="timeInForceOptions"
            value-attribute="value"
            option-attribute="label"
            placeholder="Select duration"
          />
        </UFormGroup>

        <UFormGroup 
          v-if="form.timeInForce === 'DAY'"
          label="Expires At" 
          name="expiresAt"
        >
          <UInput
            v-model="form.expiresAt"
            type="datetime-local"
          />
        </UFormGroup>
      </div>

      <!-- Order Summary -->
      <UCard class="bg-gray-50 dark:bg-gray-800/50">
        <template #header>
          <h4 class="font-semibold text-gray-900 dark:text-white">Order Summary</h4>
        </template>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Order Type:</span>
            <span class="font-medium">{{ getOrderTypeLabel(form.orderType) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Symbol:</span>
            <span class="font-medium">{{ form.symbol || '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Side:</span>
            <span class="font-medium flex items-center gap-2">
              <UIcon 
                v-if="form.side"
                :name="getSideIcon(form.side)" 
                :class="getSideColor(form.side)"
              />
              {{ form.side || '--' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Quantity:</span>
            <span class="font-medium">{{ form.quantity || 0 }} shares</span>
          </div>
          <div v-if="form.price" class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Price:</span>
            <span class="font-medium">${{ form.price.toFixed(2) }}</span>
          </div>
          <div v-if="estimatedTotal > 0" class="flex justify-between border-t pt-3">
            <span class="text-gray-600 dark:text-gray-400">Estimated Total:</span>
            <span class="font-bold text-lg">${{ estimatedTotal.toLocaleString() }}</span>
          </div>
          <div v-if="commissionEstimate" class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Est. Commission:</span>
            <span class="font-medium text-red-600">${{ commissionEstimate.total_commission.toFixed(2) }}</span>
          </div>
        </div>
      </UCard>

      <!-- OCO Linked Order -->
      <UCard v-if="form.orderType === 'OCO'" class="border-purple-200 dark:border-purple-700/30">
        <template #header>
          <h4 class="font-semibold text-purple-900 dark:text-purple-100">Linked Order (OCO)</h4>
        </template>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Linked Order Type" name="linkedOrderType">
              <USelectMenu
                v-model="linkedOrder.orderType"
                :options="linkedOrderTypes"
                placeholder="Select order type"
              />
            </UFormGroup>

            <UFormGroup label="Linked Side" name="linkedSide">
              <USelectMenu
                v-model="linkedOrder.side"
                :options="sideOptions"
                placeholder="Buy or Sell"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Quantity" name="linkedQuantity" required>
              <UInput
                v-model.number="linkedOrder.quantity"
                type="number"
                placeholder="Number of shares"
                min="1"
              />
            </UFormGroup>

            <UFormGroup 
              v-if="linkedOrder.orderType === 'LIMIT'"
              label="Price" 
              name="linkedPrice"
            >
              <UInput
                v-model.number="linkedOrder.price"
                type="number"
                step="0.01"
                placeholder="Price per share"
              />
            </UFormGroup>

            <UFormGroup 
              v-if="linkedOrder.orderType === 'STOP_LOSS' || linkedOrder.orderType === 'TAKE_PROFIT'"
              label="Stop Price" 
              name="linkedStopPrice"
            >
              <UInput
                v-model.number="linkedOrder.stopPrice"
                type="number"
                step="0.01"
                placeholder="Stop trigger price"
              />
            </UFormGroup>
          </div>
        </div>
      </UCard>

      <!-- Error Display -->
      <UAlert
        v-if="error"
        color="red"
        variant="solid"
        :title="error"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link' }"
        @close="error = ''"
      />

      <!-- Submit Buttons -->
      <div class="flex gap-4 pt-6 border-t">
        <UButton
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
          class="flex-1"
          size="lg"
        >
          {{ form.orderType === 'OCO' ? 'Buat OCO Order' : `Buat Order ${getSideLabel(form.side)}` }}
        </UButton>
        <UButton
          @click="resetForm"
          variant="outline"
          :disabled="isSubmitting"
          size="lg"
        >
          Reset
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { z } from 'zod'
import { useAdvancedOrders, type OrderRequest, type OrderType, type OrderSide, type TimeInForce } from '~/composables/useAdvancedOrders'

// Props & Emits
const props = defineProps<{
  preselectedSymbol?: string
}>()

const emit = defineEmits<{
  orderCreated: [order: any]
  ocoCreated: [orders: { parentOrder: any, linkedOrder: any }]
}>()

// Composables
const { 
  createOrder,
  createOCOOrder,
  calculateCommissionEstimate,
  getOrderTypeLabel
} = useAdvancedOrders()

const { stocks } = useApi()

// Reactive state
const isSubmitting = ref(false)
const error = ref('')
const selectedStock = ref<any>(null)
const commissionEstimate = ref<any>(null)
const trailingType = ref('amount')
const trailingValue = ref<number | null>(null)

// Available options
const availableSymbols = ref<string[]>([])
const availableStocks = ref<any[]>([])

// Form state
const form = ref({
  symbol: '',
  orderType: 'MARKET' as OrderType,
  side: 'BUY' as OrderSide,
  quantity: 1,
  price: null as number | null,
  stopPrice: null as number | null,
  timeInForce: 'GTC' as TimeInForce,
  expiresAt: null as string | null
})

const linkedOrder = ref({
  orderType: 'LIMIT' as OrderType,
  side: 'SELL' as OrderSide,
  quantity: 1,
  price: null as number | null,
  stopPrice: null as number | null
})

// Order types configuration
const orderTypes = [
  {
    value: 'MARKET',
    label: 'Market',
    description: 'Execute immediately',
    icon: 'i-heroicons-bolt'
  },
  {
    value: 'LIMIT',
    label: 'Limit',
    description: 'Execute at specific price',
    icon: 'i-heroicons-cursor-arrow-rays'
  },
  {
    value: 'STOP_LOSS',
    label: 'Stop Loss',
    description: 'Limit downside risk',
    icon: 'i-heroicons-shield-check'
  },
  {
    value: 'TAKE_PROFIT',
    label: 'Take Profit',
    description: 'Lock in gains',
    icon: 'i-heroicons-trophy'
  },
  {
    value: 'TRAILING_STOP',
    label: 'Trailing Stop',
    description: 'Dynamic stop loss',
    icon: 'i-heroicons-arrows-right-left'
  },
  {
    value: 'OCO',
    label: 'OCO',
    description: 'One cancels other',
    icon: 'i-heroicons-link'
  }
]

const sideOptions = [
  { label: 'Buy', value: 'BUY' },
  { label: 'Sell', value: 'SELL' },
  { label: 'Short', value: 'SHORT' },
  { label: 'Cover', value: 'COVER' }
]

const timeInForceOptions = [
  { label: 'Good Till Cancelled (GTC)', value: 'GTC' },
  { label: 'Immediate or Cancel (IOC)', value: 'IOC' },
  { label: 'Fill or Kill (FOK)', value: 'FOK' },
  { label: 'Day Order', value: 'DAY' }
]

const trailingOptions = [
  { label: 'Dollar Amount', value: 'amount' },
  { label: 'Percentage', value: 'percentage' }
]

const linkedOrderTypes = [
  { label: 'Limit', value: 'LIMIT' },
  { label: 'Stop Loss', value: 'STOP_LOSS' },
  { label: 'Take Profit', value: 'TAKE_PROFIT' }
]

// Form validation schema
const formSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  orderType: z.string(),
  side: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().nullable().optional(),
  stopPrice: z.number().nullable().optional(),
  timeInForce: z.string(),
  expiresAt: z.string().nullable().optional()
})

// Computed properties
const symbolOptions = computed(() => {
  return availableStocks.value.map(stock => ({
    label: `${stock.symbol} - ${stock.name}`,
    value: stock.symbol
  }))
})

const needsPrice = computed(() => {
  return form.value.orderType === 'LIMIT'
})

const needsStopPrice = computed(() => {
  return ['STOP_LOSS', 'TAKE_PROFIT'].includes(form.value.orderType)
})

const stockChange = computed(() => {
  if (!selectedStock.value) return 0
  return selectedStock.value.current_price - selectedStock.value.previous_close
})

const stockChangePct = computed(() => {
  if (!selectedStock.value || selectedStock.value.previous_close === 0) return 0
  return (stockChange.value / selectedStock.value.previous_close) * 100
})

const estimatedTotal = computed(() => {
  if (!form.value.quantity || !selectedStock.value) return 0
  
  let price = selectedStock.value.current_price
  if (form.value.orderType === 'LIMIT' && form.value.price) {
    price = form.value.price
  }
  
  return form.value.quantity * price
})

const isFormValid = computed(() => {
  if (!form.value.symbol || !form.value.quantity) return false
  
  if (form.value.orderType === 'LIMIT' && !form.value.price) return false
  if (needsStopPrice.value && !form.value.stopPrice) return false
  if (form.value.orderType === 'TRAILING_STOP' && !trailingValue.value) return false
  
  if (form.value.orderType === 'OCO') {
    if (!linkedOrder.value.quantity) return false
    if (linkedOrder.value.orderType === 'LIMIT' && !linkedOrder.value.price) return false
    if (['STOP_LOSS', 'TAKE_PROFIT'].includes(linkedOrder.value.orderType) && !linkedOrder.value.stopPrice) return false
  }
  
  return true
})

// Methods
const selectOrderType = (type: string) => {
  form.value.orderType = type as OrderType
  
  // Reset type-specific fields
  form.value.price = null
  form.value.stopPrice = null
  trailingValue.value = null
  
  // Set default time in force based on order type
  if (type === 'MARKET') {
    form.value.timeInForce = 'IOC'
  } else {
    form.value.timeInForce = 'GTC'
  }
}

const onSymbolChange = async (value: string) => {
  form.value.symbol = value
  
  // Fetch stock data when symbol changes
  if (value && availableStocks.value.length > 0) {
    const stock = availableStocks.value.find(s => s.symbol === value)
    if (stock) {
      selectedStock.value = stock
      
      // Calculate commission estimate if we have price and quantity
      if (form.value.quantity && estimatedTotal.value > 0) {
        try {
          const estimate = await calculateCommissionEstimate(
            estimatedTotal.value,
            form.value.orderType,
            'stock'
          )
          commissionEstimate.value = estimate
        } catch (error) {
          console.error('Failed to calculate commission:', error)
        }
      }
    }
  }
}

const onSideChange = (value: string) => {
  console.log('Side changed to:', value)
  // The v-model should handle this automatically, but we'll ensure it's set
  form.value.side = value as OrderSide
}

const selectSide = (side: string) => {
  console.log('Side selected:', side)
  form.value.side = side as OrderSide
}

const getSideIcon = (side: string) => {
  const icons = {
    'BUY': 'i-heroicons-arrow-trending-up',
    'SELL': 'i-heroicons-arrow-trending-down', 
    'SHORT': 'i-heroicons-arrow-down-circle',
    'COVER': 'i-heroicons-arrow-up-circle'
  }
  return icons[side] || 'i-heroicons-minus'
}

const getSideColor = (side: string) => {
  const colors = {
    'BUY': 'text-emerald-500',
    'SELL': 'text-red-500',
    'SHORT': 'text-orange-500', 
    'COVER': 'text-blue-500'
  }
  return colors[side] || 'text-gray-500'
}

const getSideLabel = (side: string) => {
  const labels = {
    'BUY': 'Beli',
    'SELL': 'Jual', 
    'SHORT': 'Short',
    'COVER': 'Cover'
  }
  return labels[side] || side
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    const orderRequest: any = {
      stock_symbol: form.value.symbol,
      order_type: form.value.orderType,
      side: form.value.side,
      quantity: form.value.quantity,
      time_in_force: form.value.timeInForce,
    }
    
    // Add optional fields only if they have values
    if (form.value.price) orderRequest.price = form.value.price
    if (form.value.stopPrice) orderRequest.stop_price = form.value.stopPrice
    if (form.value.expiresAt) orderRequest.expires_at = form.value.expiresAt
    
    // Add trailing stop parameters
    if (form.value.orderType === 'TRAILING_STOP') {
      if (trailingType.value === 'amount' && trailingValue.value) {
        orderRequest.trailing_amount = trailingValue.value
      } else if (trailingType.value === 'percentage' && trailingValue.value) {
        orderRequest.trailing_percent = trailingValue.value
      }
    }
    
    if (form.value.orderType === 'OCO') {
      const linkedOrderRequest: any = {
        stock_symbol: form.value.symbol,
        order_type: linkedOrder.value.orderType,
        side: linkedOrder.value.side,
        quantity: linkedOrder.value.quantity,
        time_in_force: form.value.timeInForce,
      }
      
      if (linkedOrder.value.price) linkedOrderRequest.price = linkedOrder.value.price
      if (linkedOrder.value.stopPrice) linkedOrderRequest.stop_price = linkedOrder.value.stopPrice
      
      const result = await createOCOOrder(orderRequest, linkedOrderRequest)
      emit('ocoCreated', result)
      
      console.log('OCO Order created successfully:', result)
    } else {
      const result = await createOrder(orderRequest)
      emit('orderCreated', result)
      
      console.log('Order created successfully:', {
        type: form.value.orderType,
        side: form.value.side,
        symbol: form.value.symbol,
        quantity: form.value.quantity
      })
    }
    
    // Don't reset form for better UX - user might want to place another similar order
    // resetForm()
  } catch (err: any) {
    error.value = err.message || 'Failed to create order'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    symbol: props.preselectedSymbol || '',
    orderType: 'MARKET',
    side: 'BUY',
    quantity: 1,
    price: null,
    stopPrice: null,
    timeInForce: 'GTC',
    expiresAt: null
  }
  
  linkedOrder.value = {
    orderType: 'LIMIT',
    side: 'SELL',
    quantity: 1,
    price: null,
    stopPrice: null
  }
  
  trailingType.value = 'amount'
  trailingValue.value = null
  selectedStock.value = null
  commissionEstimate.value = null
  error.value = ''
}

// Load available stocks on mount
onMounted(async () => {
  try {
    const response = await stocks.getAll()
    if (response.data?.stocks) {
      availableStocks.value = response.data.stocks
      availableSymbols.value = response.data.stocks.map(stock => stock.symbol)
    }
    
    // Set preselected symbol if provided
    if (props.preselectedSymbol) {
      form.value.symbol = props.preselectedSymbol
      await onSymbolChange(props.preselectedSymbol)
    }
  } catch (error) {
    console.error('Failed to load stocks:', error)
  }
})

// Watch for changes in form values to update commission estimates
watch([() => form.value.quantity, () => form.value.price, () => selectedStock.value], async () => {
  if (selectedStock.value && form.value.quantity && estimatedTotal.value > 0) {
    try {
      const estimate = await calculateCommissionEstimate(
        estimatedTotal.value,
        form.value.orderType,
        'stock'
      )
      commissionEstimate.value = estimate
    } catch (error) {
      console.error('Failed to calculate commission:', error)
      // Fallback commission calculation
      commissionEstimate.value = {
        base_commission: 5.0,
        regulatory_fees: 0.5,
        clearing_fees: 0.25,
        platform_fees: 1.0,
        total_commission: 6.75,
        effective_rate: 0.001
      }
    }
  }
})

// Debug watch for side changes to track any unexpected modifications
watch(() => form.value.side, (newSide, oldSide) => {
  if (oldSide && newSide !== oldSide) {
    console.log(`Side changed from ${oldSide} to ${newSide}`)
  }
}, { immediate: true })
</script>

<style scoped>
.advanced-order-form {
  @apply max-w-4xl mx-auto;
}

.form-header {
  @apply mb-6 pb-4 border-b border-gray-200 dark:border-gray-700;
}

.order-type-selector {
  @apply mb-6;
}

.order-type-btn {
  @apply flex flex-col items-center p-4 text-center border-2 rounded-xl transition-all duration-200;
  @apply hover:border-primary-300 hover:shadow-md;
}

.order-type-active {
  @apply border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md;
}

.order-type-inactive {
  @apply border-gray-200 dark:border-gray-700 hover:border-primary-300;
}

/* Side Selection Styles */
.side-option-btn {
  @apply flex flex-col items-center p-3 text-center border-2 rounded-lg transition-all duration-200;
  @apply hover:border-primary-300 hover:shadow-sm;
}

.side-option-active {
  @apply border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm;
}

.side-option-inactive {
  @apply border-gray-200 dark:border-gray-700 hover:border-primary-300;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .order-type-selector .grid {
    @apply grid-cols-2;
  }
  
  .order-type-btn {
    @apply p-3 text-sm;
  }
  
  .side-option-btn {
    @apply p-2 text-xs;
  }
}
</style> 