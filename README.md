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

#### ✅ Solutions:
1. **Use ClientOnly wrapper** for dynamic content:
   ```vue
   <ClientOnly>
     <component-with-dynamic-data />
     <template #fallback>
       <loading-skeleton />
     </template>
   </ClientOnly>
   ```

2. **Ensure SSR-safe state management**:
   ```javascript
   const isAuthenticated = computed(() => {
     // During SSR, only check basic conditions
     if (!process.client) return !!token.value
     
     // On client, check full state
     return !!token.value && !!user.value
   })
   ```

3. **Initialize data properly**:
   ```javascript
   // ❌ Don't do this
   const data = ref(Date.now()) // Different on server/client
   
   // ✅ Do this instead
   const data = ref(null)
   onMounted(() => {
     data.value = Date.now()
   })
   ```

### 🔌 Browser Extension Errors

Extension errors like "runtime.lastError" are automatically filtered out by our error handler plugin.

#### Manual filtering (if needed):
```javascript
// In plugins/error-handler.client.ts
console.error = (...args) => {
  const message = args[0]?.toString() || ''
  if (message.includes('runtime.lastError')) return
  originalError.apply(console, args)
}
```

### 🚨 Common Issues:

1. **Authentication state mismatch**:
   - Use `isHydrated` flag before rendering auth-dependent content
   - Wrap auth components with `ClientOnly`

2. **Time-sensitive data**:
   - Avoid server/client timestamp differences
   - Use `ClientOnly` for real-time components

3. **Dynamic imports**:
   - Use `ClientOnly` for heavy components
   - Provide fallback loading states


