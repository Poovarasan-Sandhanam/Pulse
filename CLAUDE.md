# Pulse

Simulated crypto trading app. Expo/React Native client with no real backend — prices come from a local Geometric Brownian Motion simulator, not a live API.

## Stack

- **Expo SDK 57** + **React Native 0.86** + **React 19**, new architecture (Reanimated 4, JSI/worklets)
- **Routing**: `expo-router` (file-based, typed routes)
- **Client state**: `zustand` — one store per domain
- **Server/async state**: `@tanstack/react-query` (provider mounted at root, not yet used for real requests)
- **Charts/motion**: `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-gesture-handler`
- **Lists**: `@shopify/flash-list`
- **Native module**: `modules/pulse-core` — custom Expo module (Kotlin + Swift) exposing haptics via JSI
- **Testing**: Jest + `jest-expo` + `@testing-library/react-native`

## Folder conventions

```
app/                       Expo Router routes — THIN wrappers only.
                            Extract params/navigation (useLocalSearchParams, useRouter),
                            then render a Screen from src/features/. No business logic here.

src/
  features/<name>/<Name>Screen.tsx   Actual screen implementations, one folder per feature
  store/                     zustand stores (useMarketStore, usePortfolioStore, useTradeStore, useSettingsStore)
                             Flat `create<State>((set) => ({...}))`, state + actions colocated,
                             updates via functional `set((state) => ...)`. No persist/devtools middleware.
  services/                 Non-UI logic (MarketSimulator, orderService, BiometricService, haptics, sound)
  chart/                    Skia price-chart engine (SkiaPriceChart, ChartCrosshair, ChartTooltip, ChartGestureHandler)
  motion/                   Animation design system: tokens.ts (durations), springs.ts (Reanimated springs),
                             primitives/ (AnimatedNumber, AnimatedCard, AnimatedPressable, MotionContainer)
  components/               Shared interactive components (MotionBottomSheet, SwipeToConfirm)
  theme/tokens.ts           Single source of truth for colors, spacing, radius, typography — don't hardcode values
  native/                   Safe fallback wrappers over native modules (must degrade gracefully in Expo Go/web)
  tests/                    One *.test.ts per store/service, not co-located __tests__ folders

modules/pulse-core/         Custom native module — see rule below
docs/                       architecture.md, decisions.md, accessibility.md, motion-system.md,
                             performance.md, gestures.md — check decisions.md before proposing
                             architectural changes (documents *why*, not just what)
```

**Conventions to follow:**
- High-frequency values (gesture drag, chart crosshair position) belong in Reanimated shared values, not Zustand/React state — avoids re-renders during 60fps interaction.
- Dark-only palette; use semantic tokens from `src/theme/tokens.ts` (`colors.positive`/`colors.negative` for gains/losses, `typography.mono*` for numeric/price display).
- Path alias `@/*` → `src/*` is configured in `tsconfig.json` but not consistently used yet — existing code favors relative imports; match the surrounding file rather than mixing styles within one file.
- Route files stay thin (see `app/` above) — put logic in `src/features/`, not in `app/`.

## Commands

| Purpose | Command |
|---|---|
| Install deps | `npm install` |
| Start dev server | `npm start` (= `expo start`) |
| Run on Android | `npm run android` (= `expo run:android`) |
| Run on iOS | `npm run ios` (= `expo run:ios`) |
| Run on web | `npm run web` |
| Test | `npm test` (= `jest --watchAll=false`) |
| Lint | `npm run lint` (= `expo lint`) |
| EAS build (dev client) | `eas build --profile development` |
| EAS build (internal preview APK) | `eas build --profile preview` |
| EAS build (iOS simulator) | `eas build --profile preview-simulator` |
| EAS build (production) | `eas build --profile production` |

Note: `npm run lint` was just wired up in this session (`expo lint` in `package.json`). No ESLint config exists yet — the first run will prompt to install `eslint-config-expo` and generate the config. Let that prompt complete before treating a lint run as failed.

## Rules

- **Never edit files under `ios/` or `android/` without asking first.** These are native project files (mostly generated/managed via Expo prebuild and `modules/pulse-core`'s native sources) — confirm with the user before touching anything in either directory.
- **Always run `npm run lint` after making changes**, and fix what it reports before considering a change done.
- Don't add real network/API calls to replace `MarketSimulator` without discussing it first — the offline simulator is a deliberate architectural decision (see `docs/decisions.md`).
