import type * as React from 'react';
import type { AccessibilityProps, ColorValue, ImageProps } from 'react-native';

/**
 * Props shared by every icon renderer.
 */
export type IconElementProps = AccessibilityProps & {
  /** Color applied to the icon. Images use this value as their tint color. */
  color?: ColorValue;
  /** Rendered icon height. */
  height?: number;
  /** Used to locate the icon in end-to-end tests. */
  testID?: string;
  /** Rendered icon width. */
  width?: number;
};

/**
 * Describes an icon glyph supplied by an icon font.
 */
export type FontIconSource = {
  /** Unicode codepoint for the glyph. */
  codepoint: number;
  /** Font family containing the glyph. */
  fontFamily?: string;
};

export type SvgIconSource = React.ComponentType<IconElementProps>;

type ImageIconProps = {
  imageSource: ImageProps['source'];
  fontSource?: never;
  svgSource?: never;
};

type FontIconProps = {
  fontSource: FontIconSource;
  imageSource?: never;
  svgSource?: never;
};

type SvgIconProps = {
  svgSource: SvgIconSource;
  fontSource?: never;
  imageSource?: never;
};

/**
 * Allows an Icon slot to be replaced through `as` without requiring unused source props.
 */
type EmptyIconProps = {
  fontSource?: never;
  imageSource?: never;
  svgSource?: never;
};

export type IconProps = IconElementProps & { ref?: never } & (ImageIconProps | FontIconProps | SvgIconProps | EmptyIconProps);
