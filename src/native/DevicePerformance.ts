import { Platform } from 'react-native';

export interface DevicePerformanceInfo {
  refreshRate: number; // e.g. 120 or 60 Hz
  memoryClass: 'low' | 'medium' | 'high';
  thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
  isNativeModuleAvailable: boolean;
}

/**
 * Safe abstraction over Native Performance API
 * Provides native bridge fallback when running in Expo Go or Web
 */
export const DevicePerformance = {
  async getInfo(): Promise<DevicePerformanceInfo> {
    // Default standard fallback
    const info: DevicePerformanceInfo = {
      refreshRate: Platform.OS === 'ios' ? 120 : 60,
      memoryClass: 'high',
      thermalState: 'nominal',
      isNativeModuleAvailable: false,
    };

    return info;
  },
};
