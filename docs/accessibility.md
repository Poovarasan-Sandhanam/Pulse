# Accessibility & Reduce Motion

Pulse is designed to be accessible to all users:

## Reduce Motion System
- Listens to `useSettingsStore` and system accessibility settings.
- When Reduce Motion is enabled:
  - Complex multi-stage spring transitions are replaced by fast opacity fades.
  - Skia charts disable continuous animated path transitions while preserving crosshair scrubbing.
  - Button presses disable scale spring transformations.

## Touch Targets & Contrast
- Minimum touch target height of 44pt on all interactive elements.
- WCAG AA compliant dark fintech color contrast ratios (Primary text `#F8FAFC` on obsidian `#0B0E14`).
