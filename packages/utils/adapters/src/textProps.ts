import type { TextProps, TextStyle, StyleProp } from 'react-native';
import type { TextProps as TextPropsWindows, TextStyle as TextStyleWindows } from 'react-native-windows';
import type { TextProps as TextPropsMacOS, TextStyle as TextStyleMacOS } from 'react-native-macos';
import type { TextProps as TextPropsWin32, TextStyle as TextStyleWin32 } from '@office-iss/react-native-win32';

/**
 * Build up the styles type by combining the base TextStyle with platform specific extensions,
 * omitting any overlapping keys to prevent conflicts.
 */
type TextStyleWithMacOS = TextStyle & Omit<TextStyleMacOS, keyof TextStyle>;
type TextStyleWithWindows = TextStyleWithMacOS & Omit<TextStyleWindows, keyof TextStyleWithMacOS>;
export type ITextStyle = TextStyleWithWindows & Omit<TextStyleWin32, keyof TextStyleWithWindows>;

/**
 * Build up the props type by combining the base TextProps with platform specific extensions,
 * omitting any overlapping keys to prevent conflicts and adding in the resolved style type
 */
type TextPropsWithMacOS = Omit<TextProps, 'style'> & Omit<TextPropsMacOS, keyof TextProps>;
type TextPropsWithWindows = TextPropsWithMacOS & Omit<TextPropsWindows, keyof TextPropsWithMacOS | 'style'>;
export type ITextProps = TextPropsWithWindows &
  Omit<TextPropsWin32, keyof TextPropsWithWindows | 'style'> & {
    style?: StyleProp<ITextStyle>;
  };
