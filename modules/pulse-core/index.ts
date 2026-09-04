import { requireNativeModule } from 'expo-modules-core';

// This call loads the native module object from the JSI registry.
const PulseCore = requireNativeModule('PulseCore');

export function playHaptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') {
  return PulseCore.playHaptic(style);
}
