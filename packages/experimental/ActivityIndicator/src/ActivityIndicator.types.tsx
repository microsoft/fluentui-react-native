import { Animated, ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';

export const activityIndicatorName = 'ActivityIndicator';
/**
 * Specifies the possible sizes of the ActivityIndicator
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

export interface ActivityIndicatorSlotProps {
  root: ViewProps & ActivityIndicatorTokens;
  svg: Animated.AnimatedProps<SvgProps>;
}

export interface ActivityIndicatorProps extends ActivityIndicatorTokens, ViewProps {
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

export interface ActivityIndicatorType {
  props: ActivityIndicatorProps;
  slotProps: ActivityIndicatorSlotProps;
  tokens: ActivityIndicatorTokens;
}
