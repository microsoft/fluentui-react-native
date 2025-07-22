import { getMemoCache, mergeStyles } from '@fluentui-react-native/framework';

import type { SvgIconProps } from './SvgIcon.types';

const rasterImageStyleCache = getMemoCache();

export const useSvgIcon = (props: SvgIconProps): SvgIconProps => {
  const { accessible, style, height, width, ...rest } = props;
  return {
    accessible: accessible ?? true,
    height,
    style: mergeStyles(style, rasterImageStyleCache({ width, height }, [width, height])[0]),
    width,
    ...rest,
  };
};
