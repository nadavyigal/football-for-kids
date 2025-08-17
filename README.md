# ליגת הניחושים (Football Prediction League)

A React Native football prediction app built with Expo Router, designed for Hebrew-speaking users to predict match outcomes in football leagues.

## 🚀 Features

- **Football Predictions**: Users can predict match outcomes
- **League System**: Organized prediction leagues
- **Chat Functionality**: Real-time chat between users
- **Leaderboard**: Track top predictors
- **User Profiles**: Personalized user experience
- **Cross-Platform**: Runs on iOS, Android, and Web
- **Hebrew Support**: Fully localized for Hebrew speakers

## 🛠 Tech Stack

- **Framework**: React Native 0.79.1
- **Development Platform**: Expo v53
- **Navigation**: Expo Router v5
- **Language**: TypeScript
- **UI**: React Native with Expo components
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated
- **Web Deployment**: Vercel

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── index.tsx        # Home screen
│   ├── create.tsx       # Create predictions
│   ├── chat.tsx         # Chat functionality
│   ├── leaderboard.tsx  # Rankings
│   └── profile.tsx      # User profile
├── _layout.tsx          # Root layout
└── +not-found.tsx       # 404 page
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ligat-hanichushim.git
   cd ligat-hanichushim
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the app:
   - **iOS**: Press `i` to open iOS Simulator
   - **Android**: Press `a` to open Android Emulator
   - **Web**: Press `w` to open in browser

## 📦 Available Scripts

- `npm run dev` - Start the development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Web Deployment (Vercel)

1. Build the web version:
   ```bash
   npm run build:web
   ```

2. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```

### Mobile Deployment

For mobile app deployment, use Expo Application Services (EAS):

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure and build:
   ```bash
   eas build --platform all
   ```

## 🎨 Key Dependencies

- **@expo/vector-icons**: Icon library
- **expo-router**: File-based routing
- **react-navigation**: Navigation components
- **lucide-react-native**: Modern icon library
- **expo-blur**: Native blur effects
- **expo-camera**: Camera functionality
- **expo-haptics**: Haptic feedback

## 🔧 Configuration

The app is configured through:
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## 📱 Platform Support

- **iOS**: Native iOS app via Expo
- **Android**: Native Android app via Expo
- **Web**: Progressive Web App (PWA) ready

## 🌍 Internationalization

- Primary language: Hebrew (עברית)
- RTL (Right-to-Left) text support
- Localized UI components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private. All rights reserved.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Football Prediction App
- **Target Audience**: Hebrew-speaking football fans

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Device/platform information

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using React Native and Expo