# Performance Engineering & UI-Thread Optimization

## Large Dataset Rendering & Downsampling (1k – 100k Points)

When rendering high-frequency financial charts, converting thousands of raw coordinate points directly into SVG or canvas vectors causes significant CPU overhead and frame stutter during gestures.

Pulse implements a high-performance chart rendering pipeline:

1. **LTTB Data Reduction (Largest-Triangle-Three-Buckets)**: Downsamples large datasets (up to 100,000 points) to screen pixel resolution (~500 points) in < 15ms. Preserves mathematical peaks and troughs while keeping vector complexity constant.
2. **Viewport Domain Culling**: Uses $O(\log N)$ binary search slicing to cull off-screen data points before path conversion.
3. **Native RN Overlay for Labels & Accessibility**: Isolates price/time text labels and screen reader nodes (`accessible={true}`, `accessibilityRole="summary"`) into native React Native View overlays over the canvas. The canvas is left to focus purely on GPU vector operations.

## UI Thread vs JS Thread Architecture

In traditional React Native applications, gesture events travel over the bridge to the JavaScript thread, trigger a `setState` update, execute React reconciliation, and pass layout properties back to the native view layer. This process takes multiple frame intervals (16.6ms–33ms), leading to dropped frames (jank).

Pulse avoids JS thread overhead for high-frequency interactions:

1. **Reanimated Worklets**: Gesture handlers run JavaScript code compiled to native worklets directly on the UI thread.
2. **Shared Values**: Touch positions, drag offsets, and opacity levels are stored in Reanimated `SharedValue` instances.
3. **React Native Skia Shaders**: Skia paths and gradients compile down to native C++ graphics operations, rendering smooth 60/120 FPS price lines.
4. **FlashList Optimization**: Crypto market lists use `@shopify/flash-list` with `estimatedItemSize` and memoized rows to prevent row re-renders when single prices tick.
