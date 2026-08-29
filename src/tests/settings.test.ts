import { useSettingsStore } from '../store/useSettingsStore';

describe('Settings Store', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'dark',
      hapticsEnabled: true,
      soundEnabled: true,
      reduceMotion: false,
      performanceMode: 'quality',
    });
  });

  it('toggles settings options correctly', () => {
    const { setHapticsEnabled, setSoundEnabled, setReduceMotion, setPerformanceMode } =
      useSettingsStore.getState();

    setHapticsEnabled(false);
    expect(useSettingsStore.getState().hapticsEnabled).toBe(false);

    setSoundEnabled(false);
    expect(useSettingsStore.getState().soundEnabled).toBe(false);

    setReduceMotion(true);
    expect(useSettingsStore.getState().reduceMotion).toBe(true);

    setPerformanceMode('performance');
    expect(useSettingsStore.getState().performanceMode).toBe('performance');
  });
});
