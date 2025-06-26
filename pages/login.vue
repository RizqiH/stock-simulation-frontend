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
          Welcome back
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your StockSim Pro account
        </p>
      </div>

      <!-- Login Form -->
      <UCard class="p-8">
        <UForm :schema="schema" :state="state" @submit="handleLogin" class="space-y-6">
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
              placeholder="Enter your password"
              icon="i-heroicons-lock-closed"
              size="lg"
              :disabled="loading"
            />
          </UFormGroup>

          <div class="flex items-center justify-between">
            <UCheckbox v-model="state.rememberMe" label="Remember me" />
            <UButton variant="link" size="sm" to="/forgot-password">
              Forgot password?
            </UButton>
          </div>

          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            :disabled="!state.email || !state.password"
          >
            Sign in
          </UButton>
        </UForm>

        <!-- Divider -->
        <UDivider label="or" class="my-6" />

        <!-- Social Login -->
        <div class="space-y-3">
          <UButton variant="outline" size="lg" block icon="i-heroicons-building-office-2">
            Continue as Guest
          </UButton>
        </div>

        <!-- Register Link -->
        <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <UButton variant="link" to="/register" class="font-medium">
            Sign up for free
          </UButton>
        </p>
      </UCard>

      <!-- Error Alert -->
      <UAlert
        v-if="error"
        color="red"
        variant="solid"
        title="Login Failed"
        :description="error"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link' }"
        @close="error = ''"
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

const { login } = useAuth()
const loading = ref(false)
const error = ref('')

// Form state
const state = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Validation schema
const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
})

// Handle login
const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await login(state.value.email, state.value.password)
    
    // Redirect to dashboard on success
    navigateTo('/dashboard')
  } catch (err) {
    error.value = err.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>


