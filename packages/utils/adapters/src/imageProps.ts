import type { ImageProps, ImageStyle, StyleProp } from 'react-native';
import type { ImageAdditions, CursorValue } from './platformProps';

/**
 * Build up the styles type by combining the base ImageStyle with the cross-platform extensions
 * the React Native forks add (currently just `cursor`).
 */
export type IImageStyle = ImageStyle & { cursor?: CursorValue };

/**
 * Build up the props type by combining the base ImageProps with the platform-neutral fork additions,
 * omitting any overlapping keys to prevent conflicts and adding in the resolved style type
 */
export type IImageProps = Omit<ImageProps, 'style'> &
  Omit<ImageAdditions, keyof ImageProps | 'style'> & {
    style?: StyleProp<IImageStyle>;
  };
