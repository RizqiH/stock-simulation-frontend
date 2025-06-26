<template>
  <UContainer>
    <!-- Page Header -->
    <section class="py-8">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <UIcon name="i-heroicons-user-circle" class="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Settings -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Personal Information -->
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Personal Information</h3>
          </template>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup label="Username" required>
                <UInput v-model="profileForm.username" placeholder="Enter username" />
              </UFormGroup>
              
              <UFormGroup label="Email" required>
                <UInput v-model="profileForm.email" type="email" placeholder="Enter email" />
              </UFormGroup>
            </div>

            <UFormGroup label="Bio">
              <UTextarea v-model="profileForm.bio" placeholder="Tell us about yourself..." rows="3" />
            </UFormGroup>

            <UAlert v-if="profileError" color="red" variant="solid" :title="profileError" />

            <div class="flex gap-3">
              <UButton @click="updateProfile" :loading="isUpdating">
                Save Changes
              </UButton>
              <UButton @click="resetForm" variant="outline" :disabled="isUpdating">
                Reset
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Trading Preferences -->
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Trading Preferences</h3>
          </template>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup label="Default Trading Amount">
                <UInput v-model.number="preferences.defaultAmount" type="number" placeholder="1000" />
              </UFormGroup>
              
              <UFormGroup label="Risk Tolerance">
                <USelectMenu v-model="preferences.riskTolerance" :options="riskOptions" />
              </UFormGroup>
            </div>

            <div class="space-y-4">
              <h4 class="font-semibold text-gray-900 dark:text-white">Notifications</h4>
              
              <UCheckbox v-model="preferences.emailNotifications" label="Email Notifications" />
              <UCheckbox v-model="preferences.priceAlerts" label="Price Alerts" />
              <UCheckbox v-model="preferences.marketUpdates" label="Market Updates" />
            </div>

            <UButton @click="savePreferences" :loading="isSavingPreferences">
              Save Preferences
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Account Summary -->
      <div class="space-y-8">
        <!-- Account Stats -->
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Account Summary</h3>
          </template>
          
          <div class="space-y-6">
            <div class="text-center">
              <UAvatar
                :text="user?.username?.charAt(0) || 'U'"
                size="xl"
                class="bg-gradient-to-br from-primary-500 to-purple-600 mx-auto mb-4"
              />
              <h4 class="font-bold text-lg text-gray-900 dark:text-white">
                {{ user?.username || 'User' }}
              </h4>
              <p class="text-gray-600 dark:text-gray-400">
                {{ user?.email }}
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Current Balance</span>
                <span class="font-semibold text-emerald-600">
                  ${{ user?.balance?.toLocaleString() || '0' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Total Profit</span>
                <span :class="[
                  'font-semibold',
                  (user?.total_profit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                ]">
                  {{ (user?.total_profit || 0) >= 0 ? '+' : '' }}${{ Math.abs(user?.total_profit || 0).toLocaleString() }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Global Rank</span>
                <span class="font-semibold">#{{ user?.rank || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Quick Actions -->
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Quick Actions</h3>
          </template>
          
          <div class="space-y-3">
            <UButton to="/dashboard" variant="outline" block icon="i-heroicons-squares-2x2">
              Go to Dashboard
            </UButton>
            <UButton to="/portfolio" variant="outline" block icon="i-heroicons-briefcase">
              View Portfolio
            </UButton>
            <UButton to="/transactions" variant="outline" block icon="i-heroicons-document-text">
              Transaction History
            </UButton>
            <UButton @click="exportData" variant="outline" block icon="i-heroicons-arrow-down-tray">
              Export Data
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'auth'
});

// SEO
useHead({
  title: 'Profile Settings - StockSim Pro'
});

// Composables
const { user, refreshProfile } = useAuth();
const { user: userApi } = useApi();
const { success, error: notifyError } = useNotifications();

// Reactive data
const isUpdating = ref(false);
const isSavingPreferences = ref(false);
const profileError = ref('');

// Forms
const profileForm = reactive({
  username: user.value?.username || '',
  email: user.value?.email || '',
  bio: user.value?.bio || ''
});

const preferences = ref({
  defaultAmount: 1000,
  riskTolerance: 'medium',
  emailNotifications: true,
  priceAlerts: true,
  marketUpdates: false
});

// Options
const riskOptions = [
  { label: 'Conservative', value: 'low' },
  { label: 'Moderate', value: 'medium' },
  { label: 'Aggressive', value: 'high' }
];

// Methods
const updateProfile = async () => {
  try {
    isUpdating.value = true;
    profileError.value = '';
    
    success('Profile Updated', 'Your profile has been updated successfully');
    await refreshProfile();
  } catch (error) {
    profileError.value = error.message || 'Failed to update profile';
  } finally {
    isUpdating.value = false;
  }
};

const savePreferences = async () => {
  try {
    isSavingPreferences.value = true;
    
    // Save preferences (mock implementation)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    success('Preferences Saved', 'Your trading preferences have been saved');
  } catch (error) {
    notifyError('Failed to Save', 'Could not save preferences');
  } finally {
    isSavingPreferences.value = false;
  }
};

const exportData = async () => {
  try {
    // Export user data (mock implementation)
    const data = {
      profile: user.value,
      preferences: preferences.value,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stocksim-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    success('Data Exported', 'Your data has been exported successfully');
  } catch (error) {
    notifyError('Export Failed', 'Could not export data');
  }
};

const resetForm = () => {
  profileForm.username = user.value?.username || '';
  profileForm.email = user.value?.email || '';
  profileForm.bio = user.value?.bio || '';
  profileError.value = '';
};

// Initialize form when user data is loaded
watch(user, (newUser) => {
  if (newUser) {
    profileForm.username = newUser.username || '';
    profileForm.email = newUser.email || '';
    profileForm.bio = newUser.bio || '';
  }
}, { immediate: true });
</script>

<style scoped>
/* Component-specific styles */
</style> 