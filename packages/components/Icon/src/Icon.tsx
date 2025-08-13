import { FontIcon } from './FontIcon/FontIcon';
import type { IconProps } from './Icon.types';
import { SvgIcon } from './SvgIcon/SvgIcon';

export const Icon = (props: IconProps) => {
  return props.svgSource ? (
    <SvgIcon color={props.color} height={props.size} width={props.size} {...props.svgSource} />
  ) : props.fontSource ? (
    <FontIcon color={props.color} fontSize={props.size} {...props.fontSource} />
  ) : null;
};
