import { ColorValue } from './Color.types';
import { ViewStyle, TextStyle } from 'react-native';
import { Typography } from './Typography.types';

/**
 * Standard token set for foreground color
 */
export interface ForegroundColorTokenSet {
  color?: ColorValue;
}

/**
 * Standard token set for background color
 */
export interface BackgroundColorTokenSet {
  backgroundColor?: ColorValue;
}

/**
 * Standard token set for setting a border color
 */
export interface BorderColorTokenSet {
  borderColor?: ColorValue;
}

/**
 * The standard color token sets, together in one type for convenience
 */
export type ColorTokenSet = ForegroundColorTokenSet & BackgroundColorTokenSet & BorderColorTokenSet;

/**
 * Border token settings which can be applied
 */
export interface BorderTokenSet extends BorderColorTokenSet {
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: ViewStyle['borderStyle'];
}

/**
 * Token set for adding font variant support
 */
export interface FontVariantTokenSet {
  variant?: keyof Typography['variants'];
}

/**
 * Standard token set for setting text properties
 */
export interface FontStyleTokenSet {
  fontFamily?: keyof Typography['families'] | TextStyle['fontFamily'];
  fontSize?: keyof Typography['sizes'] | TextStyle['fontSize'];
  fontWeight?: keyof Typography['weights'] | TextStyle['fontWeight'];
}

/**
 * Combined token set for standard text properties with added variant support
 */
export type FontTokenSet = FontStyleTokenSet & FontVariantTokenSet;
