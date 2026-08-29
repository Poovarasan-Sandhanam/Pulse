# Gesture Handling Architecture

Pulse implements two hero gesture systems using `react-native-gesture-handler`:

## 1. Chart Scrubbing & Pinch Zoom (`ChartGestureHandler`)
- **Pan Gesture**: Simultaneous pan gesture tracks crosshairs across the Skia canvas. Worklets compute price interpolations and update crosshair coordinates (`touchX`, `touchY`) on the UI thread.
- **Pinch Gesture**: Scales time intervals dynamically without JS re-renders.

## 2. Hero Swipe-To-Confirm (`SwipeToConfirm`)
- **Direct Manipulation**: Pan gesture tracks thumb translation bounded between 0 and maximum track length.
- **Haptic Feedback**: Crosses 50% threshold to emit a selection haptic.
- **Gesture Lock**: Reaching 85%+ threshold locks the gesture, snaps thumb to 100% via a stiff spring, triggers success haptics, and morphs the arrow into a checkmark.
