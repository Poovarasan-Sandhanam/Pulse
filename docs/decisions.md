# Key Architectural Decisions & Tradeoffs

## 1. Expo Router File-Based Routing vs React Navigation
- **Decision**: Selected Expo Router v3.
- **Rationale**: Provides native file-based routing with typed routes (`app/(tabs)/markets/[id].tsx`), seamless tab switching, and native stack animations.

## 2. React Native Skia vs SVG / Canvas Chart Libraries
- **Decision**: Built custom line chart engine with `@shopify/react-native-skia`.
- **Rationale**: Skia runs C++ graphics operations on the GPU/native render thread, eliminating JS bridge latency during scrubbing.

## 3. Geometric Brownian Motion Market Simulator
- **Decision**: Designed deterministic, local random walk engine in `MarketSimulator.ts`.
- **Rationale**: Allows 60 FPS real-time testing of high-frequency price updates, list re-rendering performance, and trade execution without external API dependencies or network rate limits.
