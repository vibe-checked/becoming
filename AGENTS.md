# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Project: Becoming

Meditation/affirmation app. Expo SDK 56, TypeScript, Zustand, AsyncStorage.

## Architecture

- `src/core/` — Pure TypeScript, no React imports. Types, themes, affirmations, session timing logic, persistence, Unsplash API.
- `src/store/` — Zustand store with all app state and persistence.
- `src/ui/` — React Native components. Single-screen app with Modal overlays, no navigation library.
- `App.tsx` — Root: screen router, AppState listener, hydration.

## Key patterns

- State: Zustand store, persisted to AsyncStorage with versioned key (`becoming:state:v2`).
- Animations: Reanimated 4 SharedValues + withTiming/withSequence on the UI thread.
- Session loop: `setInterval` at 50ms, wall-clock elapsed time (`Date.now() - sessionStartedAt`).
- Audio: expo-av for background music, expo-speech for TTS. Music ducks during TTS.
- Images: CrossFadeView supports both gradient (LinearGradient) and photo (Image) sources.

## Commands

- `npm start` — Start Expo dev server
- `npx tsc --noEmit` — Type-check
- `npx expo install <pkg>` — Install SDK-compatible packages
- `eas build --platform ios` — Production iOS build
