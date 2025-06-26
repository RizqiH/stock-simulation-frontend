import VueApexCharts from 'vue3-apexcharts'
import ApexCharts from 'apexcharts'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueApexCharts)
  
  // Make ApexCharts available globally
  if (process.client) {
    window.ApexCharts = ApexCharts
  }
}) 