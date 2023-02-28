import type { Animated, ActivityIndicatorProps as CoreActivityIndicatorProps } from 'react-native';

import type { SvgProps } from 'react-native-svg';

export const activityIndicatorName = 'ActivityIndicator';
/**
 * Specifies the possible sizes of the ActivityIndicator.
 */
export type ActivityIndicatorSize = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

export interface ActivityIndicatorTokens {
  /**
   * ActivityIndicator element color
   * @defaultValue 'BDBDBD' for light mode, '666666' for dark mode
   */
  activityIndicatorColor?: string;
  /**
   * Line thickness of the ActivityIndicator
   * @defaultValue 'medium' or what size is set to
   */
  lineThickness?: ActivityIndicatorSize;
  /**
   * Size of the ActivityIndicator view
   * @defaultValue 'medium'
   */
  size?: ActivityIndicatorSize;
}

export interface ActivityIndicatorProps extends ActivityIndicatorTokens, Omit<CoreActivityIndicatorProps, 'size'> {
  /**
   * ActivityIndicator animating or not
   * @defaultValue 'true'
   */
  animating?: boolean;
  /**
   * ActivityIndicator hidden when not animating or not hidden
   * @defaultValue 'true'
   */
  hidesWhenStopped?: boolean;
}

export interface FluentActivityIndicatorSlotProps {
  root: ActivityIndicatorProps;
  svg: Animated.AnimatedProps<SvgProps>;
}
export interface FluentActivityIndicatorType {
  props: ActivityIndicatorProps;
  slotProps: FluentActivityIndicatorSlotProps;
  tokens: ActivityIndicatorTokens;
}

export interface CoreActivityIndicatorSlotProps {
  root: CoreActivityIndicatorProps;
}

export interface CoreActivityIndicatorType {
  props: ActivityIndicatorProps;
  slotProps: CoreActivityIndicatorSlotProps;
  tokens: ActivityIndicatorTokens;
}
