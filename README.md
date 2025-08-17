# ליגת הניחושים (Football Prediction League)

[![Deployment Status](https://img.shields.io/badge/deployment-ready-green.svg)](https://github.com/nadavyigal/football-for-kids)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.1-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-v53-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

A modern React Native football prediction app built with Expo Router and Supabase backend, designed for Hebrew-speaking users to create prediction groups, compete with friends, and track leaderboards in football matches.

## 🌐 Live Demo

- **Web App**: [Coming Soon - Will be deployed on Vercel]
- **Mobile**: Download from App Store / Play Store (Coming Soon)

## 🚀 Features

- **Group Management**: Create and join football prediction groups
- **Match Predictions**: Predict outcomes for upcoming matches
- **Real-time Chat**: Group communication with live updates
- **Leaderboard System**: Points-based ranking system
- **Admin Controls**: Group admins can approve/reject matches
- **User Authentication**: Secure login with Supabase Auth
- **Real-time Updates**: Live match status and prediction updates
- **Cross-Platform**: Runs on iOS, Android, and Web
- **Hebrew RTL Support**: Fully localized for Hebrew speakers

## 🛠 Technology Stack

### Frontend
- **Framework**: React Native 0.79.1 with Expo v53
- **Navigation**: Expo Router v5 (file-based routing)
- **Language**: TypeScript with strict mode
- **UI Components**: React Native core + Lucide React Native icons
- **Styling**: React Native StyleSheet with LinearGradient
- **State Management**: React hooks (useState, useEffect)

### Backend & Database
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email/password
- **Real-time**: Supabase Realtime for live updates
- **API**: RESTful API with TypeScript client
- **File Storage**: Supabase Storage (ready for future use)

### Deployment
- **Web**: Vercel (Static Site Generation)
- **Mobile**: Expo Application Services (EAS)
- **Backend**: Supabase Cloud (managed)

## 📱 App Architecture

### Frontend Structure
```
app/
├── (tabs)/
│   ├── index.tsx        # Home screen - match dashboard
│   ├── create.tsx       # Create new matches
│   ├── chat.tsx         # Group chat with real-time
│   ├── leaderboard.tsx  # Points leaderboard
│   └── profile.tsx      # User profile management
├── _layout.tsx          # Root layout with navigation
└── +not-found.tsx       # 404 page

components/
├── MatchCard.tsx        # Individual match display
├── PredictionForm.tsx   # Match prediction input
├── ChatMessage.tsx      # Chat message component
└── LeaderboardItem.tsx  # Leaderboard entry

hooks/
├── useSupabase.ts       # Supabase client hook
├── useAuth.ts           # Authentication hook
├── useRealtime.ts       # Real-time subscriptions
└── useFrameworkReady.ts # Expo framework initialization

lib/
├── supabase.ts          # Supabase client configuration
├── api.ts               # API functions and types
├── auth.ts              # Authentication utilities
└── realtime.ts          # Real-time subscription management
```

### Backend Architecture (Supabase)
```
Database Tables:
├── profiles             # User profiles and metadata
├── groups              # Prediction groups
├── group_members       # Group membership with roles
├── matches             # Football matches
├── predictions         # User predictions for matches
├── chat_messages       # Group chat messages
└── leaderboards        # Points and rankings

Real-time Features:
├── Match updates       # Live match status changes
├── New predictions     # Real-time prediction updates
├── Chat messages       # Live group chat
└── Leaderboard changes # Real-time points updates

Security:
├── Row Level Security (RLS) enabled on all tables
├── User-based access control
├── Group-based permissions
└── Admin role management
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Supabase account (free at [supabase.com](https://supabase.com))

### Backend Setup (Supabase)

1. **Create a Supabase Project**:
   - Visit [supabase.com](https://supabase.com) and create a new project
   - Save your project URL and anon key

2. **Set up Database**:
   - The database schema is automatically created via the deployment scripts
   - Run the SQL scripts from the `supabase/` directory in your Supabase SQL editor

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nadavyigal/football-for-kids.git
   cd football-for-kids
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env and add your Supabase credentials:
   # EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   # EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or with no telemetry
   EXPO_NO_TELEMETRY=1 expo start
   ```

5. **Open the app**:
   - **iOS**: Press `i` to open iOS Simulator
   - **Android**: Press `a` to open Android Emulator  
   - **Web**: Press `w` to open in browser

### Verify Setup

Run the test scripts to verify your backend connection:
```bash
node test-connection.js
node verify-deployment.js
```

## 📦 Available Scripts

- `npm run dev` - Start the development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint
- `node test-connection.js` - Test Supabase connection
- `node verify-deployment.js` - Verify backend deployment
- `node deploy-backend.js` - Deploy backend schema to Supabase

## 🌐 Deployment

### Backend Deployment (Supabase)

The backend is automatically deployed to Supabase cloud. To set up your own instance:

1. **Automated Setup**:
   ```bash
   # Deploy complete backend schema
   node deploy-backend.js
   
   # Or deploy individual components
   node deploy-simple.js     # Basic tables
   ./deploy-sql.sh          # All SQL scripts
   ```

2. **Manual Setup**:
   - Copy SQL files from `supabase/` to your Supabase SQL editor
   - Run them in the correct order (see `DEPLOYMENT_GUIDE.md`)

### Web Deployment (Vercel)

1. **Automatic Deployment** (Recommended):
   - Connect your GitHub repository to Vercel
   - Vercel will automatically build and deploy on every push to main
   - Set environment variables in Vercel dashboard

2. **Manual Deployment**:
   ```bash
   # Build for web
   npm run build:web
   
   # Deploy to Vercel
   npx vercel --prod
   ```

3. **Environment Variables for Vercel**:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Mobile Deployment (EAS)

For native mobile app deployment:

1. **Setup EAS**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure Build**:
   ```bash
   eas build:configure
   ```

3. **Build for Stores**:
   ```bash
   # Build for both platforms
   eas build --platform all
   
   # Or build individually
   eas build --platform ios
   eas build --platform android
   ```

4. **Submit to Stores**:
   ```bash
   # Submit to App Store
   eas submit --platform ios
   
   # Submit to Play Store  
   eas submit --platform android
   ```

## 🎨 Key Dependencies

### Frontend Dependencies
- **@expo/vector-icons**: Comprehensive icon library
- **expo-router**: File-based routing system
- **lucide-react-native**: Modern icon library
- **expo-linear-gradient**: Gradient backgrounds
- **expo-blur**: Native blur effects
- **expo-haptics**: Haptic feedback

### Backend Dependencies  
- **@supabase/supabase-js**: Supabase JavaScript client
- **supabase**: Supabase CLI and utilities
- **@types/node**: Node.js TypeScript definitions

### Development Dependencies
- **@expo/cli**: Expo development tools
- **typescript**: TypeScript compiler
- **eslint**: Code linting
- **prettier**: Code formatting

## 🔧 Configuration Files

- **`app.json`**: Expo configuration and build settings
- **`tsconfig.json`**: TypeScript compiler configuration
- **`package.json`**: Dependencies and npm scripts
- **`.env.example`**: Environment variables template
- **`supabase/config.toml`**: Supabase local development config
- **`CLAUDE.md`**: AI assistant development guidelines

## 📱 Platform Support

- **iOS**: Native iOS app via Expo (iOS 13+)
- **Android**: Native Android app via Expo (API level 21+)
- **Web**: Progressive Web App (PWA) with offline support
- **Desktop**: Web app works on desktop browsers

## 🌍 Internationalization & Accessibility

- **Primary Language**: Hebrew (עברית)
- **Text Direction**: RTL (Right-to-Left) support
- **Accessibility**: Screen reader compatible
- **Responsive Design**: Works on all screen sizes
- **Dark Mode**: Coming soon

## 🏗 Database Schema

The Supabase database includes these main tables:

```sql
-- User profiles with metadata
profiles (id, username, email, avatar_url, created_at)

-- Prediction groups
groups (id, name, description, admin_id, created_at)

-- Group membership with roles
group_members (group_id, user_id, role, joined_at)

-- Football matches
matches (id, home_team, away_team, match_date, status, group_id)

-- User predictions
predictions (id, user_id, match_id, home_score, away_score, points)

-- Group chat messages
chat_messages (id, group_id, user_id, message, created_at)

-- Leaderboard data
leaderboards (user_id, group_id, total_points, rank)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write TypeScript with strict mode enabled
- Add tests for new features
- Update documentation as needed
- Ensure RTL compatibility for Hebrew text
- Test on both mobile and web platforms

## 🔒 Security

- Row Level Security (RLS) is enabled on all database tables
- User authentication is handled by Supabase Auth
- API keys are managed through environment variables
- No sensitive data is stored in the client code

## 📝 License

This project is private. All rights reserved.

## 👥 Team

- **Developer**: Football Kids Development Team
- **Project Type**: Mobile-First Football Prediction App
- **Target Audience**: Hebrew-speaking football fans and families
- **Repository**: [https://github.com/nadavyigal/football-for-kids](https://github.com/nadavyigal/football-for-kids)

## 🐛 Bug Reports & Issues

If you find a bug, please create an issue with:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: Device, OS version, browser (for web)
- **Logs**: Any relevant console errors

## 📈 Roadmap

- [x] Basic match prediction functionality
- [x] Group management system
- [x] Real-time chat
- [x] Leaderboard system
- [x] Supabase backend integration
- [x] Web deployment ready
- [ ] Push notifications
- [ ] Dark mode support
- [ ] Advanced statistics
- [ ] Social sharing features
- [ ] Mobile app store deployment

## 📞 Support

- **Issues**: Create an issue on [GitHub](https://github.com/nadavyigal/football-for-kids/issues)
- **Documentation**: See `DEPLOYMENT_GUIDE.md` for setup instructions
- **Backend**: Supabase documentation and community support

## 🔗 Related Files

- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [`SUPABASE_BACKEND_SUMMARY.md`](./SUPABASE_BACKEND_SUMMARY.md) - Backend architecture details
- [`CLAUDE.md`](./CLAUDE.md) - AI assistant development guidelines

---

**Built with ❤️ using React Native, Expo, and Supabase**

*Making football predictions fun for Hebrew-speaking families and friends!*