// WebSocket Diagnostics Plugin
// Load WebSocket testing tools for debugging real-time updates

export default defineNuxtPlugin(() => {
  // Import the WebSocket tester
  import('~/utils/websocket-tester').then((module) => {
    // WebSocket tester will auto-register itself to window
    console.log('🔧 WebSocket Diagnostics Loaded')
    console.log('💡 Use testWebSocket() in browser console to diagnose real-time issues')
  }).catch((error) => {
    console.error('❌ Failed to load WebSocket diagnostics:', error)
  })
}) 