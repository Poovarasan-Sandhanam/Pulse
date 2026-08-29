# Pulse — Motion-First Mobile Trading Simulator

**Pulse** is a mobile-first crypto trading simulation application built with React Native, Reanimated v3, React Native Gesture Handler, React Native Skia, Zustand, `@shopify/flash-list`, and Expo Router.

It serves as a showcase of mobile interaction design, gesture handling, high-frequency chart rendering, UI-thread vs JS-thread performance engineering, physical spring physics, and accessibility.

---

## Technical Stack

- **Framework**: React Native 0.74 / Expo SDK 51 with Expo Router v3
- **Graphics & Charts**: `@shopify/react-native-skia`
- **Animations**: `react-native-reanimated` v3
- **Gestures**: `react-native-gesture-handler`
- **State Management**: Zustand
- **List Performance**: `@shopify/flash-list`
- **Feedback Systems**: Expo Haptics & Expo AV Audio
- **Testing**: Jest & React Native Testing Library

---

## Key Features

1. **Portfolio Overview**: Animated balance counter (`AnimatedNumber`), P&L badges, asset breakdown, and pull-to-refresh.
2. **Markets Screen**: Search & watchlist filter, live Geometric Brownian Motion price ticks (500–1500ms), animated sparklines, FlashList rendering.
3. **Asset Details**: Large interactive Skia Price Chart with pan scrub crosshairs, pinch zoom, timeframe selector (1H, 1D, 1W, 1M, 1Y).
4. **Trading Bottom Sheet (`MotionBottomSheet`)**: Custom bottom sheet with spring physics, drag velocity, and snap points.
5. **Hero `SwipeToConfirm` Interaction**: Direct-manipulation drag handle, progress bar fill, 50% haptic selection feedback, 100% gesture lock, and checkmark morph animation.
6. **Developer Performance Lab**: Live FPS counter, side-by-side JS Thread vs UI Thread gesture benchmark comparison, and stress test tool.
7. **Settings**: Dark mode design system, Haptics toggle, Sound toggle, Reduce Motion support, and Quality / Balanced / Performance modes.

---

## Getting Started

```bash
# Install dependencies
yarn install

# Run unit and component test suite
yarn test

# Start Expo development server
yarn start
```

---

## Documentation

- [Architecture Guide](./docs/architecture.md)
- [Motion System & Spring Physics](./docs/motion-system.md)
- [Performance Engineering & Worklets](./docs/performance.md)
- [Gesture Architecture](./docs/gestures.md)
- [Accessibility & Reduce Motion](./docs/accessibility.md)
- [Technical Decisions & Rationale](./docs/decisions.md)
