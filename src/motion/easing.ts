import { Easing } from 'react-native-reanimated';

export const easings = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
};
