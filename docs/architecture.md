# Pulse Architecture & Technical Design

## Architecture Overview

Pulse is structured around a feature-based architecture separating presentation, state, simulation engines, and motion primitives.

```text
src/
├── app/                  # Expo Router file-based route definitions
├── theme/                # Design System Tokens (Colors, Spacing, Typography, Radii)
├── motion/               # Motion Design System
│   ├── tokens.ts         # Spring configurations & duration constants
│   ├── springs.ts        # Reanimated spring definitions
│   └── primitives/       # AnimatedNumber, AnimatedPressable, AnimatedCard
├── chart/                # Skia Price Chart Engine
│   ├── SkiaPriceChart.tsx
│   ├── ChartCrosshair.tsx
│   ├── ChartTooltip.tsx
│   └── ChartGestureHandler.tsx
├── components/           # Reusable physical interaction components
│   ├── MotionBottomSheet.tsx
│   └── SwipeToConfirm.tsx
├── features/             # Feature modules
│   ├── portfolio/
│   ├── markets/
│   ├── asset/
│   ├── trading/
│   ├── activity/
│   ├── settings/
│   └── performance/
├── services/             # Core logic & simulators
│   ├── market/           # Geometric Brownian Motion tick engine
│   ├── trading/          # Simulated order placement service
│   ├── haptics.ts        # Expo Haptics wrapper
│   └── sound.ts          # Expo AV feedback
├── store/                # Zustand client state stores
└── native/               # Native bridge fallbacks (DevicePerformance)
```

## Data Flow & State Management

1. **Client State**: Zustand stores (`useMarketStore`, `usePortfolioStore`, `useTradeStore`, `useSettingsStore`) hold static and semi-static state.
2. **Animation State**: High-frequency values (scrub crosshair position, swipe drag translation) are held exclusively in Reanimated Shared Values on the UI thread.
3. **Simulated Market Feed**: `MarketSimulator` emits price updates via a deterministic random walk (GBM) every 500ms–1500ms without causing full-app re-renders.
