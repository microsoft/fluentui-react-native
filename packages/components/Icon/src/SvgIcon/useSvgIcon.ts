import { getMemoCache, mergeStyles } from '@fluentui-react-native/framework';

import type { SvgIconProps } from './SvgIcon.types';
import type { ImageStyle } from 'react-native';

const rasterImageStyleCache = getMemoCache();

export const useSvgIcon = (props: SvgIconProps): SvgIconProps => {
  const { accessible, style, height, width, ...rest } = props;
  return {
    accessible: accessible ?? true,
    height,
    style: mergeStyles<ImageStyle>(style, rasterImageStyleCache({ width, height }, [width, height])[0]),
    width,
    ...rest,
  };
};
