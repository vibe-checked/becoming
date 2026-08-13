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

## iOS local build gotchas (SDK 56, discovered 2026-08-12)

`ios/` is gitignored (generated via `expo prebuild`) — these fixes live in
gitignored files (`ios/Podfile.properties.json`, `package.json`) and will be
silently lost if `ios/` is ever regenerated from scratch (`rm -rf ios && expo
prebuild` or `expo prebuild --clean`). If the app crashes on launch again with
a `dyld: Symbol not found` error mentioning `ExpoModulesCore`/`ExpoImage`, or a
build fails with `rnworklets-generated.mm` "Build input file cannot be found",
reapply both of these:

1. **Disable Expo's precompiled-modules system.** SDK 56 defaults to linking
   `ExpoModulesCore`/`ExpoImage`/etc. as prebuilt XCFrameworks
   (`EXPO_USE_PRECOMPILED_MODULES=1` unless overridden — see `ios/Podfile`).
   The prebuilt `ExpoImage` and `ExpoModulesCore` xcframework pair shipped for
   this SDK version has a genuine Swift ABI mismatch (`ExpoImage` calls a
   `Record.from(dictionary:appContext:)` static func that `ExpoModulesCore`'s
   binary doesn't export) — reproduces even from a fully clean `pod install`,
   it's not a stale-cache issue. Fix: add `"EXPO_USE_PRECOMPILED_MODULES":
   "false"` to `ios/Podfile.properties.json`, then `rm -rf ios/Pods
   ios/Podfile.lock ios/build && cd ios && pod install`. This forces every
   Expo module to build from source instead, which is slower but ABI-safe.
2. **`react-native-worklets` must be a direct `package.json` dependency**, not
   just a transitive dep of `react-native-reanimated`. Without it, CocoaPods'
   codegen discovery (podspec scan) still wires up a `rnworklets-generated.mm`
   compile step in the `ReactCodegen` Xcode target, but the autolinking
   discovery that actually runs codegen never finds the package, so the file
   is never generated — a permanent `Build input file cannot be found` error,
   not a transient race. Fix: `npm install react-native-worklets@0.8.3` (or
   whatever version `node_modules/react-native-worklets/package.json` already
   resolves to) as an explicit dependency, then `pod install` again.

Always build with `npx expo run:ios --configuration Release --device
"<simulator-UDID>"` from the repo root (not a raw `xcodebuild -derivedDataPath
build` invocation) — a custom derived-data path breaks the `[Expo] Remove
duplicate codegen output` / codegen script phases' relative-path assumptions.
