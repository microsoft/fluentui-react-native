import type { Animated, TextProps, ViewProps } from 'react-native';

import type { SvgProps } from 'react-native-svg';

export const spinnerName = 'Spinner';
/**
 * Specifies the possible appearance of the Spinner.
 */
export type SpinnerAppearance = 'primary' | 'inverted';
/**
 * Specifies the possible label position of the Spinner.
 */
export type SpinnerLabelPosition = 'above' | 'below' | 'before' | 'after';
/**
 * Specifies the possible sizes of the Spinner.
 */
export type SpinnerSize = 'tiny' | 'xx-small' | 'x-small' | 'small' | 'medium' | 'large' | 'x-large' | 'huge';
/**
 * Specifies the possible status of the Spinner.
 */
export type SpinnerStatus = 'active' | 'inactive';

export interface SpinnerTokens {
  /**
   * Spinner element color
   */
  trackColor?: string;
  /**
   * Spinner element color
   * Note: This is not supported on mobile platforms
   */
  tailColor?: string;
  /**
   * Size of the Spinner view
   * @defaultValue 'medium'
   */
  size?: SpinnerSize;
}

export interface SpinnerProps extends ViewProps, SpinnerTokens {
  /**
   * Spinner appearnace
   * @defaultValue 'primary'
   * Note: This is not supported on mobile platforms
   */
  appearance?: SpinnerAppearance;
  /**
   * Spinner label position
   * @defaultValue 'after'
   * Note: This is not supported on mobile platforms
   */
  labelPosition?: SpinnerLabelPosition;
  /**
   * Spinner size
   * @defaultValue 'medium'
   */
  size?: SpinnerSize;
  /**
   * Spinner animating or not
   * @defaultValue 'active'
   */
  status?: SpinnerStatus;
  /**
   * Spinner label
   * Note: This is not supported on mobile platforms
   */
  label?: string;
  /**
   * Spinner hidden when not animating or not hidden
   * @defaultValue 'true'
   * @platform android
   */
  hidesWhenStopped?: boolean;
}

export interface SpinnerSvgProps extends SpinnerTokens {
  /**
   * The height and width of the viewBox are internal props used by the SVG to size themselves and
   * set up their viewBox to establish coordinate space for DPI scaling purposes.
   */
  viewBoxHeight: number;
  viewBoxWidth: number;
}

export interface SpinnerSlotProps {
  root: SpinnerProps; //SpinnerProps extends ViewProps which is required for win32 native module.
  track?: SpinnerSvgProps;
  tail?: SpinnerSvgProps;
  tailContainer?: SpinnerSvgProps;
  label?: TextProps;
  svg?: Animated.AnimatedProps<SvgProps>;
}
export interface SpinnerType {
  props: SpinnerProps;
  slotProps: SpinnerSlotProps;
  tokens: SpinnerTokens;
}
