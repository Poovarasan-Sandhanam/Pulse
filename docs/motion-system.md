# Motion Design System

The motion language in Pulse is built around physical consistency, direct manipulation, and purpose-driven animations.

## Motion Tokens & Spring Configurations

### 1. Direct Manipulation (`snappy`)
- **Config**: `{ mass: 0.5, damping: 15, stiffness: 180 }`
- **Use Case**: Touches, button presses, swipe-to-confirm drag handle.
- **Rationale**: Immediate response with zero perceptible lag.

### 2. Sheet & Modal Settling (`gentle`)
- **Config**: `{ mass: 1.0, damping: 22, stiffness: 110 }`
- **Use Case**: `MotionBottomSheet` opening/closing, card expansion.
- **Rationale**: Smooth physical settling that mimics weighted physical cards.

### 3. Playful Feedback (`bouncy`)
- **Config**: `{ mass: 0.8, damping: 12, stiffness: 150 }`
- **Use Case**: Trade success checkmark morph and balance update flashes.
- **Rationale**: Expressive feedback for major financial accomplishments.

### 4. Rigid Snap Points (`stiff`)
- **Config**: `{ mass: 0.3, damping: 24, stiffness: 260 }`
- **Use Case**: Swipe-to-confirm 100% threshold lock and tab bar indicators.
- **Rationale**: Decisive alignment when a user crosses a critical threshold.
