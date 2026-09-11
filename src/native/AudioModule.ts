import { requireOptionalNativeModule } from 'expo-modules-core';

type AudioModule = typeof import('expo-av').Audio;

/**
 * Safe abstraction over expo-av's Audio API.
 *
 * `expo-av` calls `requireNativeModule('ExponentAV')` at module scope, and on
 * native a missing module is reported as a *fatal* error through
 * `global.ErrorUtils` rather than thrown — so it surfaces as a redbox even
 * behind `import(...).catch()`. The only reliable guard is to probe for the
 * native module first and never import expo-av when it is absent (Expo Go
 * since SDK 54, and web).
 */
let audioPromise: Promise<AudioModule | null> | undefined;

export function isAudioAvailable(): boolean {
  return requireOptionalNativeModule('ExponentAV') != null;
}

export function getAudio(): Promise<AudioModule | null> {
  if (!isAudioAvailable()) {
    return Promise.resolve(null);
  }
  audioPromise ??= import('expo-av')
    .then((m) => m.Audio)
    .catch(() => null);
  return audioPromise;
}
