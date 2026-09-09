import { requireOptionalNativeModule } from 'expo-modules-core';

// Null in Expo Go and on web, where the native module isn't linked.
const PulseCore = requireOptionalNativeModule('PulseCore');

export function playHaptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') {
  return PulseCore?.playHaptic(style);
}
