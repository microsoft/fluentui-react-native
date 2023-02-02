import type { Animated, ColorValue } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import type { ActivityIndicatorProps as CoreActivityIndicatorProps } from 'react-native';

export const spinnerName = 'Spinner';
/**
 * Specifies the possible sizes of the Spinner.
 */
export type SpinnerSize = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge';

export interface SpinnerTokens {
  /**
   * Spinner element color
   * @defaultValue 'grey56' for light mode, 'grey72' for dark mode
   */
  spinnerColor?: ColorValue;
  /**
   * Line thickness of the Spinner
   * @defaultValue 'medium' or what size is set to
   */
  lineThickness?: SpinnerSize;
  /**
   * Size of the Spinner view
   * @defaultValue 'medium'
   */
  size?: SpinnerSize;
}

export interface SpinnerProps extends SpinnerTokens, Omit<CoreActivityIndicatorProps, 'size'> {
  /**
   * Spinner animating or not
   * @defaultValue 'true'
   */
  animating?: boolean;
  /**
   * Spinner hidden when not animating or not hidden
   * @defaultValue 'true'
   */
  hidesWhenStopped?: boolean;
}

export interface SpinnerSlotProps {
  root: SpinnerProps;
  svg: Animated.AnimatedProps<SvgProps>;
}
export interface SpinnerType {
  props: SpinnerProps;
  slotProps: SpinnerSlotProps;
  tokens: SpinnerTokens;
}
