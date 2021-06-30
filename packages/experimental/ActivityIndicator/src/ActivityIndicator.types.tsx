import { ViewProps, ColorValue } from 'react-native';

export const activityIndicatorName = 'ActivityIndicator';
/**
 * Specifies the possible sizes of the ActivityIndicator
 */
// Somehow need to convert these to numbers
export type ActivityIndicatorSize = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

export interface ActivityIndicatorTokens {
  /**
   * ActivityIndicator element color
   * @defaultValue 'BDBDBD' for light mode, '666666' for dark mode
   */
  color?: ColorValue;
  /**
   * Line thickness of the ActivityIndicator
   * Both 'xSmall' and 'small' sizes have thickness of 1
   * Might not need this since this is directly dependent on the size, so can just have size
   * @defaultValue 'medium'
   */
  lineThickness?: ActivityIndicatorSize;
  /**
   * Size of the ActivityIndicator view
   * @defaultValue 'medium'
   */
  size?: ActivityIndicatorSize;
}

export interface ActivityIndicatorSlotProps extends ActivityIndicatorProps {
  root: ViewProps;
}

export interface ActivityIndicatorProps extends ActivityIndicatorTokens {
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
