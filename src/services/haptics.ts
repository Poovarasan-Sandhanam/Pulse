import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/useSettingsStore';

export const haptics = {
  tap: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  },
  selection: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
  },
  threshold: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  },
  success: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  },
  error: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  },
};
