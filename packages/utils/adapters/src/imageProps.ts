import type { ImageProps, ImageStyle, StyleProp } from 'react-native';
import type { ImageProps as ImagePropsWindows, ImageStyle as ImageStyleWindows } from 'react-native-windows';
import type { ImageProps as ImagePropsMacOS, ImageStyle as ImageStyleMacOS } from 'react-native-macos';
import type { ImageProps as ImagePropsWin32, ImageStyle as ImageStyleWin32 } from '@office-iss/react-native-win32';

/**
 * Build up the styles type by combining the base ImageStyle with platform specific extensions,
 * omitting any overlapping keys to prevent conflicts.
 */
type ImageStyleWithMacOS = ImageStyle & Omit<ImageStyleMacOS, keyof ImageStyle>;
type ImageStyleWithWindows = ImageStyleWithMacOS & Omit<ImageStyleWindows, keyof ImageStyleWithMacOS>;
export type IImageStyle = ImageStyleWithWindows & Omit<ImageStyleWin32, keyof ImageStyleWithWindows>;

/**
 * Build up the props type by combining the base ImageProps with platform specific extensions,
 * omitting any overlapping keys to prevent conflicts and adding in the resolved style type
 */
type ImagePropsWithMacOS = Omit<ImageProps, 'style'> & Omit<ImagePropsMacOS, keyof ImageProps>;
type ImagePropsWithWindows = ImagePropsWithMacOS & Omit<ImagePropsWindows, keyof ImagePropsWithMacOS | 'style'>;
export type IImageProps = ImagePropsWithWindows &
  Omit<ImagePropsWin32, keyof ImagePropsWithWindows | 'style'> & {
    style?: StyleProp<IImageStyle>;
  };
