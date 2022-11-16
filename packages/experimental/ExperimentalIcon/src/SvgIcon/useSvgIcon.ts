import { ImageStyle } from 'react-native';
import { getMemoCache, mergeStyles } from '@fluentui-react-native/framework';
import { SvgIconProps } from './SvgIcon.types';

const rasterImageStyleCache = getMemoCache<ImageStyle>();

export const useSvgIcon = (props: SvgIconProps): SvgIconProps => {
  const { style, height, width, ...rest } = props;
  return {
    height,
    style: mergeStyles(style, rasterImageStyleCache({ width, height }, [width, height])[0]),
    width,
    ...rest,
  };
};
