import { playHaptic } from '../../modules/pulse-core';
import { useSettingsStore } from '../store/useSettingsStore';

export const haptics = {
  tap: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      try { playHaptic('light'); } catch (e) {}
    }
  },
  selection: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      try { playHaptic('soft'); } catch (e) {}
    }
  },
  threshold: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      try { playHaptic('medium'); } catch (e) {}
    }
  },
  success: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      try { playHaptic('rigid'); } catch (e) {}
    }
  },
  error: () => {
    if (useSettingsStore.getState().hapticsEnabled) {
      try { playHaptic('heavy'); } catch (e) {}
    }
  },
};
