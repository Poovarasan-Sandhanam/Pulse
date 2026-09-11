import { useSettingsStore } from '../store/useSettingsStore';
import { getAudio } from '../native/AudioModule';

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
