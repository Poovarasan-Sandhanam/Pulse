import { WithSpringConfig } from 'react-native-reanimated';
import { motionSprings } from './tokens';

export const springConfig: Record<keyof typeof motionSprings, WithSpringConfig> = {
  snappy: motionSprings.snappy,
  gentle: motionSprings.gentle,
  bouncy: motionSprings.bouncy,
  stiff: motionSprings.stiff,
};
