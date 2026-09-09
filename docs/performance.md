# Performance Engineering & UI-Thread Optimization

## UI Thread vs JS Thread Architecture

In traditional React Native applications, gesture events travel over the bridge to the JavaScript thread, trigger a `setState` update, execute React reconciliation, and pass layout properties back to the native view layer. This process takes multiple frame intervals (16.6ms–33ms), leading to dropped frames (jank).

Pulse avoids JS thread overhead for high-frequency interactions:

1. **Reanimated Worklets**: Gesture handlers run JavaScript code compiled to native worklets directly on the UI thread.
2. **Shared Values**: Touch positions, drag offsets, and opacity levels are stored in Reanimated `SharedValue` instances.
3. **React Native Skia Shaders**: Skia paths and gradients compile down to native C++ graphics operations, rendering smooth 60/120 FPS price lines.
4. **FlashList Optimization**: Crypto market lists use `@shopify/flash-list` with `estimatedItemSize` and memoized rows to prevent row re-renders when single prices tick.
