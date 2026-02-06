import { getViewMask, getTextMask, getImageMask } from './filters';
import type { ViewProps, TextProps, ImageProps } from 'react-native';
import type { IFilterMask } from './filter.types';

/**
 * Filters props based on the provided mask. Each filter function is memoized to only compute the mask once,
 * as it doesn't change during the lifecycle of the app.
 */

/**
 * Filter view props
 * @param propName - The name of the prop to check against the view mask
 */
export const filterViewProps = (() => {
  let viewMask: IFilterMask<ViewProps> | undefined;
  return (propName: string): boolean => {
    viewMask ??= getViewMask();
    return Boolean(viewMask[propName]);
  };
})();

/**
 * Filter text props
 * @param propName - The name of the prop to check against the text mask
 */
export const filterTextProps = (() => {
  let textMask: IFilterMask<TextProps> | undefined;
  return (propName: string): boolean => {
    textMask ??= getTextMask();
    return Boolean(textMask[propName]);
  };
})();

/**
 * Filter image props
 * @param propName - The name of the prop to check against the image mask
 */
export const filterImageProps = (() => {
  let imageMask: IFilterMask<ImageProps> | undefined;
  return (propName: string): boolean => {
    imageMask ??= getImageMask();
    return Boolean(imageMask[propName]);
  };
})();
