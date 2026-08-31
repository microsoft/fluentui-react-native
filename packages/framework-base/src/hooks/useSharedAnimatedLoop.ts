import type { Animated } from 'react-native';

export type SharedAnimatedLoopOptions = {
  channel: string;
  duration: number;
  enabled: boolean;
  useNativeDriver: boolean;
};

/**
 * Shared animated loops require a React Native runtime.
 */
export function useSharedAnimatedLoop(_options: SharedAnimatedLoopOptions): Animated.Value {
  throw new Error('useSharedAnimatedLoop is only available in React Native environments.');
}
