import { useSettingsStore } from '../store/useSettingsStore';

type AudioModule = typeof import('expo-av').Audio;

// expo-av isn't bundled in Expo Go since SDK 54, and importing it there throws
// at module load. Resolve it lazily so its absence just disables sound.
let audioPromise: Promise<AudioModule | null> | undefined;
function getAudio(): Promise<AudioModule | null> {
  audioPromise ??= import('expo-av')
    .then((m) => m.Audio)
    .catch(() => null);
  return audioPromise;
}

class SoundService {
  async playSuccessSound() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const Audio = await getAudio();
    if (!Audio) return;
    try {
      // Gentle feedback tone using Expo AV synthesized sound or silent guard
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 0.4 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // Audio playback failed silently on unsupported environments
    }
  }

  async playTapSound() {
    if (!useSettingsStore.getState().soundEnabled) return;
    const Audio = await getAudio();
    if (!Audio) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
        { shouldPlay: true, volume: 0.2 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // Silent fallback
    }
  }
}

export const soundService = new SoundService();
