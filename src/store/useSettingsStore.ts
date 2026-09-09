import { create } from 'zustand';

export type PerformanceMode = 'quality' | 'balanced' | 'performance';

interface SettingsState {
  theme: 'dark' | 'light';
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  performanceMode: PerformanceMode;

  setTheme: (theme: 'dark' | 'light') => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  hapticsEnabled: true,
  soundEnabled: true,
  reduceMotion: false,
  performanceMode: 'quality',

  setTheme: (theme) => set({ theme }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  setPerformanceMode: (performanceMode) => set({ performanceMode }),
}));
