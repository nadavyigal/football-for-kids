# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application called "ליגת הניחושים" (Football Prediction League) built with Expo Router. The app allows users to create football match prediction groups, share matches with friends, and compete in prediction leagues.

## Development Commands

- **Start development server**: `npm run dev` or `EXPO_NO_TELEMETRY=1 expo start`
- **Build for web**: `npm run build:web` or `expo export --platform web`
- **Lint code**: `npm run lint` or `expo lint`

## Technology Stack

- **Framework**: React Native with Expo (v53.0.0)
- **Navigation**: Expo Router with typed routes
- **Language**: TypeScript with strict mode
- **UI Components**: React Native core components + Lucide React Native icons
- **Styling**: React Native StyleSheet with LinearGradient
- **State Management**: React hooks (useState, useEffect)

## Architecture

### File Structure
- `app/` - Main application screens using Expo Router file-based routing
  - `_layout.tsx` - Root layout with Stack navigation
  - `(tabs)/` - Tab-based navigation screens
    - `_layout.tsx` - Tab layout configuration with 5 tabs
    - `index.tsx` - Home screen (main dashboard)
    - `create.tsx` - Create new match screen
    - `chat.tsx` - Group chat functionality
    - `leaderboard.tsx` - Points leaderboard
    - `profile.tsx` - User profile management
- `hooks/` - Custom React hooks
  - `useFrameworkReady.ts` - Framework initialization hook
- `assets/images/` - App icons and images

### Key Components

The app follows a tab-based navigation structure with Hebrew RTL text support:

1. **Home Screen** (`app/(tabs)/index.tsx`):
   - Displays pending matches (admin approval required)
   - Shows approved active matches
   - Group information and member management
   - Admin controls for match approval/rejection

2. **Navigation Tabs**:
   - 🏠 בית (Home) - Main dashboard
   - ⚽ צור משחק (Create Match) - New match creation
   - 💬 צ'אט (Chat) - Group communication
   - 🏆 מובילים (Leaderboard) - Points ranking
   - 👤 פרופיל (Profile) - User settings

### Data Models

Key interfaces defined in the home screen:
- `Match` - Football match with predictions, status, and metadata
- `Group` - User group with members and admin privileges

### Styling Conventions

- Uses React Native StyleSheet for consistent styling
- Color scheme: Green gradients (#22C55E, #16A34A) for primary branding
- Tab bar: Dark theme (#1F2937) with rounded corners
- Cards: White background with subtle shadows and rounded corners
- RTL-friendly layout for Hebrew text

## Development Notes

- The app uses Expo's new architecture (`newArchEnabled: true`)
- TypeScript strict mode is enabled for better type safety
- The project uses path aliases (`@/*` maps to root directory)
- App supports both iOS and web platforms
- Hebrew text is used throughout the UI with appropriate RTL styling