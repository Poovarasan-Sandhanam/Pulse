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
│   ├── ChartNativeOverlay.tsx
│   ├── ChartCrosshair.tsx
│   ├── ChartTooltip.tsx
│   ├── ChartGestureHandler.tsx
│   └── utils/
│       └── dataReduction.ts  # LTTB downsampling & viewport culling engine
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
│   └── performance/      # Large dataset rendering & thread isolation benchmarks
├── services/             # Core logic & simulators
│   ├── market/           # CoinGeckoService & Geometric Brownian Motion generator
│   ├── trading/          # Simulated order placement service
│   ├── haptics.ts        # Expo Haptics wrapper
│   └── sound.ts          # Expo AV feedback
├── store/                # Zustand client state stores
└── native/               # Native bridge fallbacks (DevicePerformance)
```

## Data Pipeline & Chart Rendering Architecture

```text
PULSE CHART DATA
       │
  ┌────┴───────────────────────────┐
  │                                │
REAL DATA                      SYNTHETIC
CoinGecko BTC                  GBM Generator
(1k–10k points)                (10k–100k points)
  │                                │
  └────┬───────────────────────────┘
       ↓
  Data Pipeline
       ↓
  Viewport Culling (Binary Search Domain Bounds)
       ↓
  LTTB Data Reduction (Downsample to ~500 points)
       ↓
  Coordinate Normalization
       ↓
  Skia Path Vector Generation
       ↓
  GPU Canvas Rendering + Native RN Overlay (Text Ticks & Accessibility Nodes)
```

1. **Hybrid Data Ingestion**: Real market data is pulled via `CoinGeckoService` for realistic historical curves (~1k–10k points), while `generateSyntheticDataset` produces controlled 10k–100k point streams to isolate rendering limits.
2. **Viewport Culling**: `cullViewportData` slices array streams to visible domain bounds in $O(\log N)$ time before path calculation.
3. **LTTB Downsampling**: `downsampleLTTB` reduces high-density point streams (e.g. 100,000 points) to ~500 target points in sub-15ms execution while strictly preserving min/max local extrema and trend shape.
4. **Native Text & Accessibility Overlay**: Price/time labels and screen reader nodes (`accessible={true}`, `accessibilityRole="summary"`) are rendered in a native React Native View overlay above the canvas to preserve legibility, dynamic font scaling, and VoiceOver/TalkBack support.
