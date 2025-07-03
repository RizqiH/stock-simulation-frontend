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


