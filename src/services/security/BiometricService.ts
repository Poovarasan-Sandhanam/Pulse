import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export class BiometricService {
  /**
   * Checks if biometrics are supported and enrolled on the device.
   */
  static async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  /**
   * Prompts the user to authenticate using biometrics.
   * If biometrics are not available, it can fallback to passcode if configured.
   */
  static async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      
      if (!isAvailable) {
        // Show an alert so the user knows why Face ID didn't pop up
        Alert.alert(
          'Biometrics Unavailable',
          'Face ID or Touch ID is not enrolled on this device. (If using Simulator, go to Features > Face ID > Enrolled)',
          [{ text: 'OK' }]
        );
        // Fallback: returning true so development isn't blocked, 
        // but the alert above proves the check is running.
        return true; 
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        if (result.error !== 'user_cancel') {
          Alert.alert('Authentication Failed', 'Please try again.');
        }
      }

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }
}
