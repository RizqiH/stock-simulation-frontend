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

## 📦 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd stock-simulation-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
API_BASE_URL=http://localhost:8080/api/v1
NODE_ENV=development
```

4. **Run development server**
```bash
npm run dev
```

## 🔧 Backend Integration

### Prerequisites
Pastikan backend sudah running di `http://localhost:8080`. Lihat setup backend di folder `../stock-simulation-backend/`.

### API Endpoints yang Digunakan

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

#### Stocks
- `GET /api/v1/stocks` - Get all stocks
- `GET /api/v1/stocks/top?limit=10` - Get top performing stocks
- `GET /api/v1/stocks/:symbol` - Get stock by symbol

#### Portfolio
- `GET /api/v1/portfolio` - Get user portfolio
- `GET /api/v1/portfolio/summary` - Get portfolio summary
- `GET /api/v1/portfolio/value` - Get portfolio total value
- `GET /api/v1/portfolio/performance` - Get portfolio performance

#### Transactions
- `POST /api/v1/transactions/buy` - Buy stocks
- `POST /api/v1/transactions/sell` - Sell stocks
- `GET /api/v1/transactions` - Get transaction history

#### User
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile
- `GET /api/v1/leaderboard` - Get leaderboard

### Authentication Flow
1. User register/login → Get JWT token
2. Token stored in HTTP-only cookie
3. Setiap API call menyertakan token di header Authorization
4. Middleware `auth.ts` melindungi halaman yang memerlukan authentication

## 📁 Project Structure

```
stock-simulation-frontend/
├── assets/css/           # Global CSS dan animations
├── composables/          # Reusable composables
│   ├── useApi.ts        # API wrapper
│   └── useAuth.ts       # Authentication management
├── layouts/             # Layout components
│   └── default.vue      # Main layout dengan navigation
├── middleware/          # Route middleware
│   ├── auth.ts         # Protect authenticated routes
│   └── guest.ts        # Redirect authenticated users
├── pages/              # Application pages
│   ├── index.vue       # Landing page
│   ├── login.vue       # Login page
│   ├── register.vue    # Register page
│   ├── dashboard.vue   # User dashboard
│   ├── market.vue      # Stock market listing
│   ├── portfolio.vue   # Portfolio management
│   ├── transactions.vue # Transaction history
│   └── leaderboard.vue # User leaderboard
├── plugins/            # Nuxt plugins
│   └── auth.client.ts  # Auth initialization
└── nuxt.config.ts      # Nuxt configuration
```

## 🎨 Styling & Animations

### Custom CSS Classes
- `.gradient-bg` - Gradient background
- `.text-gradient` - Text gradient effect
- `.button-modern` - Modern button dengan hover effects
- `.card-hover` - Card hover animations
- `.floating` - Floating animation
- `.pulse-glow` - Glowing pulse effect
- `.loading-shimmer` - Loading skeleton animation

### Animation Classes
- `.fade-in` - Fade in animation
- `.slide-up` - Slide up animation
- `.bounce-in` - Bounce in animation
- `.scale-in` - Scale in animation
- `.animate-on-scroll` - Scroll-triggered animations

## 🔄 State Management

### Composables

#### `useAuth()`
```typescript
const { 
  user,           // Current user data
  isAuthenticated, // Authentication status
  isLoading,      // Loading state
  login,          // Login function
  register,       // Register function
  logout,         // Logout function
  refreshProfile  // Refresh user profile
} = useAuth()
```

#### `useApi()`
```typescript
const { 
  auth,          // Authentication API
  user,          // User API
  stocks,        // Stocks API
  portfolio,     // Portfolio API
  transactions   // Transactions API
} = useApi()
```

## 🚦 Route Protection

### Public Routes
- `/` - Landing page
- `/login` - Login page (guest only)
- `/register` - Register page (guest only)
- `/market` - Market data (public)

### Protected Routes (require authentication)
- `/dashboard` - User dashboard
- `/portfolio` - Portfolio management
- `/transactions` - Transaction history
- `/leaderboard` - Leaderboard

## 🔧 Configuration

### Nuxt Config
```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    // ... other modules
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api/v1'
    }
  }
})
```

## 📱 Responsive Design

- **Mobile First**: Designed untuk mobile dengan progressive enhancement
- **Breakpoints**: 
  - `sm`: 640px+
  - `md`: 768px+
  - `lg`: 1024px+
  - `xl`: 1280px+

## 🧪 Development

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Check
```bash
npm run type-check
```

## 🐛 Error Handling

### API Error Handling
- Network errors ditangani gracefully
- User-friendly error messages
- Retry mechanisms untuk failed requests
- Loading states untuk semua async operations

### Authentication Errors
- Token expiry handling
- Automatic logout pada unauthorized requests
- Redirect ke login page untuk protected routes

## 🔄 Real-time Features

### Auto-refresh
- Dashboard data refresh otomatis
- Market data updates
- Portfolio value updates
- Real-time price changes

### Loading States
- Skeleton loading untuk semua data
- Progressive loading untuk list items
- Loading indicators untuk form submissions

## 🎯 Performance Optimizations

- **Lazy Loading**: Components dan pages di-lazy load
- **Code Splitting**: Automatic code splitting oleh Nuxt
- **Image Optimization**: Optimized images dengan Nuxt Image
- **Caching**: API response caching
- **Bundle Size**: Optimized bundle dengan tree-shaking

## 🚀 Deployment

### Environment Variables for Production
```env
API_BASE_URL=https://your-api-domain.com/api/v1
NODE_ENV=production
```

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**StockSim Pro** - Learn stock trading with virtual money and real market data! 🚀📈
