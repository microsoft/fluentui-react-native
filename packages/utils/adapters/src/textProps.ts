import type { TextProps, TextStyle, StyleProp } from 'react-native';
import type { TextAdditions, CursorValue } from './platformProps';

/**
 * Build up the styles type by combining the base TextStyle with the cross-platform extensions
 * the React Native forks add (currently just `cursor`).
 */
export type ITextStyle = TextStyle & { cursor?: CursorValue };

/**
 * Build up the props type by combining the base TextProps with the platform-neutral fork additions,
 * omitting any overlapping keys to prevent conflicts and adding in the resolved style type
 */
export type ITextProps = Omit<TextProps, 'style'> &
  Omit<TextAdditions, keyof TextProps | 'style'> & {
    style?: StyleProp<ITextStyle>;
  };
