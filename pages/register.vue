<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Header -->
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-600 via-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UIcon name="i-heroicons-chart-bar-20-solid" class="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Start your trading journey
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create your free StockSim Pro account
        </p>
      </div>

      <!-- Registration Form -->
      <UCard class="p-8">
        <UForm :schema="schema" :state="state" @submit="handleRegister" class="space-y-6">
          <UFormGroup label="Username" name="username" required>
            <UInput
              v-model="state.username"
              placeholder="Choose a username"
              icon="i-heroicons-user"
              size="lg"
              :disabled="loading"
            />
          </UFormGroup>

          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Enter your email"
              icon="i-heroicons-envelope"
              size="lg"
              :disabled="loading"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password" required>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Create a password"
              icon="i-heroicons-lock-closed"
              size="lg"
              :disabled="loading"
            />
          </UFormGroup>

          <UFormGroup label="Confirm Password" name="confirmPassword" required>
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              icon="i-heroicons-lock-closed"
              size="lg"
              :disabled="loading"
            />
          </UFormGroup>

          <div class="space-y-3">
            <UCheckbox 
              v-model="state.agreeToTerms" 
              :label="termLabel"
              required
            />
            <UCheckbox 
              v-model="state.subscribeNewsletter" 
              label="Subscribe to our newsletter for market insights"
            />
          </div>

          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            :disabled="!isFormValid"
          >
            Create Account
          </UButton>
        </UForm>

        <!-- Features -->
        <div class="mt-8 space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            What you'll get:
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div class="flex items-center gap-3 text-sm">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-500" />
              <span class="text-gray-700 dark:text-gray-300">$100,000 virtual trading balance</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-500" />
              <span class="text-gray-700 dark:text-gray-300">Real-time market data</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-500" />
              <span class="text-gray-700 dark:text-gray-300">Advanced portfolio analytics</span>
            </div>
          </div>
        </div>

        <!-- Login Link -->
        <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <UButton variant="link" to="/login" class="font-medium">
            Sign in here
          </UButton>
        </p>
      </UCard>

      <!-- Error/Success Alerts -->
      <UAlert
        v-if="error"
        color="red"
        variant="solid"
        title="Registration Failed"
        :description="error"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link' }"
        @close="error = ''"
      />

      <UAlert
        v-if="success"
        color="emerald"
        variant="solid"
        title="Account Created!"
        description="Your account has been created successfully. You can now sign in."
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link' }"
        @close="success = false"
      />
    </div>
  </div>
</template>

<script setup>
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
  layout: false
})

const { register } = useAuth()
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Form state
const state = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  subscribeNewsletter: false
})

// Validation schema
const schema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Computed properties
const termLabel = computed(() => 
  'I agree to the Terms of Service and Privacy Policy'
)

const isFormValid = computed(() => {
  return state.value.username && 
         state.value.email && 
         state.value.password && 
         state.value.confirmPassword && 
         state.value.agreeToTerms &&
         state.value.password === state.value.confirmPassword
})

// Handle registration
const handleRegister = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await register({
      username: state.value.username,
      email: state.value.email,
      password: state.value.password
    })
    
    success.value = true
    
    // Redirect to login after short delay
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
    
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

