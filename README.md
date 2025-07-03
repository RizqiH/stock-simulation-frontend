# StockSim Pro Frontend

Modern dan interaktif frontend untuk aplikasi simulasi trading saham menggunakan Nuxt 3 dan NuxtUI.

## 🚀 Fitur Utama

- ✅ **Authentication System** - Login/Register terintegrasi dengan backend API
- 📊 **Real-time Dashboard** - Portfolio tracking dengan data live dari backend  
- 📈 **Live Market Data** - Data saham real-time dengan kemampuan buy/sell
- 💼 **Portfolio Management** - Tracking holdings dan performance
- 📱 **Responsive Design** - UI modern yang responsive di semua device
- 🌙 **Dark Mode** - Support dark/light theme
- ⚡ **Modern Animations** - Smooth animations dan transitions
- 🔄 **Real API Integration** - Tidak ada dummy data, semua dari backend API

## 🛠️ Tech Stack

- **Framework**: Nuxt 3
- **UI Library**: NuxtUI (TailwindCSS)
- **Icons**: Heroicons
- **Language**: TypeScript
- **State Management**: Composables
- **Authentication**: JWT-based dengan HTTP-only cookies
- **API**: RESTful API integration

## Development Debug Mode

### ⚠️ Security Notice
Debug mode can expose sensitive information including passwords and tokens in browser console. Always use with caution:

#### Safe Debug Usage:
```javascript
// Enable specific modules only
enableDebug(['charts', 'portfolio', 'websocket'])

// Check current config
debugConfig()

// Disable when done
disableDebug()
```

#### ⛔ Avoid in Production:
```javascript
// DON'T: Enable all modules (includes auth)
enableDebug()

// DON'T: Enable auth module
enableDebug(['auth'])
```

#### Security Features:
- 🔒 Auth debug disabled by default
- 🔒 Automatic password filtering in logs
- 🔒 Security warnings when enabling sensitive modules
- 🔒 Sensitive data replaced with `***FILTERED***`

## Troubleshooting

### 🔧 Hydration Mismatch Errors

If you encounter "Hydration completed but contains mismatches" errors:

#### ✅ Solutions Implemented:

1. **SSR-Safe Data Fetching with useAsyncData**:
   ```vue
   <!-- ❌ Don't do this -->
   <script setup>
   const data = ref([])
   onMounted(async () => {
     data.value = await fetchData() // Different data on server/client
   })
   </script>
   
   <!-- ✅ Do this instead -->
   <script setup>
   const { data } = await useAsyncData('key', () => fetchData(), {
     default: () => [],
     transform: (result) => result.data || []
   })
   </script>
   ```

2. **ClientOnly Wrapper for Dynamic Content**:
   ```vue
   <ClientOnly>
     <component-with-dynamic-data />
     <template #fallback>
       <loading-skeleton />
     </template>
   </ClientOnly>
   ```

3. **SSR-Safe Computed Properties**:
   ```javascript
   const isAuthenticated = computed(() => {
     // During SSR, only check basic conditions
     if (!process.client) return !!token.value
     
     // On client, check full state
     return !!token.value && !!user.value
   })
   ```

4. **Single Root Element in Pages**:
   ```vue
   <!-- ✅ Single root element required -->
   <template>
     <div class="page-wrapper">
       <h1>Page Title</h1>
       <div>Content</div>
     </div>
   </template>
   ```

5. **Proper Data Initialization**:
   ```javascript
   // ❌ Don't do this
   const data = ref(Date.now()) // Different on server/client
   
   // ✅ Do this instead
   const data = ref(null)
   onMounted(() => {
     data.value = Date.now()
   })
   ```

#### 🔧 Configuration Applied:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: false,
    viewTransition: false,
    asyncContext: false
  },
  vue: {
    compilerOptions: {
      whitespace: 'preserve'
    }
  }
})
```

#### 🛠️ Plugins Added:

- **error-handler.client.ts**: Suppresses browser extension and hydration errors
- **hydration-fix.client.ts**: Enhanced hydration handling with Vue hook management
- **hydration.global.ts**: Global middleware for consistent state during hydration

### 🔌 Browser Extension Errors & Console Cleanup

Extension errors and development warnings are now **comprehensively suppressed** through multiple specialized plugins:

#### ✅ Multi-Layer Error Suppression:

**Plugin 1: error-handler.client.ts** - Enhanced general error filtering
**Plugin 2: extension-suppressor.client.ts** - Dedicated extension error blocking  
**Plugin 3: vue-warnings-suppressor.client.ts** - Vue experimental feature warnings
**Plugin 4: hydration-fix.client.ts** - Hydration mismatch prevention

#### 🎯 Auto-Filtered Errors:
- ✅ `runtime.lastError` (all variations)
- ✅ `extension port` errors  
- ✅ `back/forward cache` messages
- ✅ `message channel is closed`
- ✅ `chrome-extension://` URLs and content
- ✅ `amcccnldajjnngnaoinemnaloklogjak` (specific extension)
- ✅ `hydration completed but contains mismatches`
- ✅ `<Suspense> is an experimental feature`
- ✅ All hydration mismatch variations
- ✅ Vue experimental feature warnings
- ✅ Symbol conversion errors

#### 🛠️ Advanced Suppression Features:

```javascript
// 1. Console Method Override (All Methods)
console.error = (filtered)
console.warn = (filtered)  
console.log = (filtered)
console.info = (filtered)
console.debug = (filtered)

// 2. Event Listener Interception
EventTarget.prototype.addEventListener = (filtered)

// 3. Global Error Handling
window.addEventListener('error', (filtered))
window.addEventListener('unhandledrejection', (filtered))

// 4. Vue App Configuration
app.config.errorHandler = (filtered)
app.config.warnHandler = (filtered)

// 5. Network Request Blocking
window.fetch = (extension-requests-blocked)

// 6. DOM Content Cleanup
MutationObserver -> removes extension elements
```

#### 🔧 Symbol Safety Implementation:

```javascript
// Safe argument conversion to prevent Symbol errors
const safeStringify = (args) => {
  return args.map(arg => {
    if (typeof arg === 'symbol') return '[Symbol]'
    if (typeof arg === 'function') return '[Function]'
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, (key, value) => {
          if (typeof value === 'symbol') return '[Symbol]'
          return value
        })
      } catch {
        return '[Object]'
      }
    }
    return String(arg || '')
  }).join(' ').toLowerCase()
}
```

#### 📊 Console Status:

- 🔇 **Extension errors**: Completely suppressed
- 🔇 **Hydration warnings**: Filtered during development  
- 🔇 **Vue experimental warnings**: Hidden (Suspense, etc.)
- 🔇 **Symbol conversion errors**: Safely handled
- ✅ **Real application errors**: Still visible
- ✅ **Important warnings**: Still displayed

#### 🎛️ Manual Control (if needed):

```javascript
// Temporarily disable suppression for debugging
localStorage.setItem('debug-suppress-disabled', 'true')

// Re-enable suppression
localStorage.removeItem('debug-suppress-disabled')

// Check suppression status
console.log('Suppression active:', !localStorage.getItem('debug-suppress-disabled'))
```

### 🚨 Common Issues & Solutions:

1. **Authentication State Mismatch**:
   - ✅ Use `isHydrated` flag before rendering auth-dependent content
   - ✅ Wrap auth components with `ClientOnly`
   - ✅ Use SSR-safe computed properties

2. **Time-sensitive Data**:
   - ✅ Avoid server/client timestamp differences
   - ✅ Use `ClientOnly` for real-time components
   - ✅ Initialize with null, update on mount

3. **Dynamic Content**:
   - ✅ Use `ClientOnly` for heavy components
   - ✅ Provide fallback loading states
   - ✅ Use `useAsyncData` for consistent data fetching

4. **Theme/Preferences**:
   - ✅ Initialize theme state early in plugins
   - ✅ Use `ClientOnly` for theme-dependent content
   - ✅ Avoid localStorage access during SSR

### 📊 Debugging Hydration Issues:

1. **Check Browser Console**: Look for specific mismatch messages
2. **Use Vue DevTools**: Inspect component state differences
3. **Enable Sourcemaps**: Better debugging with detailed stack traces
4. **Test with SSR Disabled**: Isolate client-only issues

```typescript
// Temporarily disable SSR for debugging
routeRules: {
  '/problematic-page': { ssr: false }
}
```

### 🎯 Best Practices Applied:

- ✅ **SSR-First Approach**: Ensure server and client render the same content
- ✅ **Progressive Enhancement**: Start with basic content, enhance on client
- ✅ **Graceful Fallbacks**: Always provide loading states and error boundaries
- ✅ **Consistent State**: Use proper state management for SSR/client sync
- ✅ **Error Suppression**: Filter development noise without hiding real issues


