import type { Animated, ViewProps } from 'react-native';

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
  /**
   * Spinner appearnace
   * @defaultValue 'false'
   */
  inverted?: SpinnerTokens;
  width?: number;
  height?: number;
  /**
   * Sizes of the Spinner
   */
  'x-small'?: SpinnerTokens;
  small?: SpinnerTokens;
  medium?: SpinnerTokens;
  large?: SpinnerTokens;
  'x-large'?: SpinnerTokens;
  /* win32 specific */
  tiny?: SpinnerTokens;
  huge?: SpinnerTokens;
  /* mobile specific */
  'xx-small'?: SpinnerTokens;
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
   * Spinner label
   * Note: This is not supported on mobile platforms
   */
  label?: string;
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
   * Spinner hidden when not animating or not hidden
   * @defaultValue 'true'
   * @platform android
   */
  hidesWhenStopped?: boolean;
}

export type SpinnerState = SpinnerProps;

export interface SpinnerSlotProps {
  root: SpinnerProps;
  svg?: Animated.AnimatedProps<SvgProps>;
}
export interface SpinnerType {
  props: SpinnerProps;
  slotProps: SpinnerSlotProps;
  tokens: SpinnerTokens;
}
