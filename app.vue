<template>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
</template>

<script setup>
// Initialize auth state on app mount
const { initialize } = useAuth()

onMounted(() => {
  // Initialize authentication state
  initialize()
})
</script>
