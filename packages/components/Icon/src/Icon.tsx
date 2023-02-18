import * as React from 'react';
import type { IconProps } from './Icon.types';
import { SvgIcon } from './SvgIcon/SvgIcon';
import { FontIcon } from './FontIcon/FontIcon';
export const Icon = (props: IconProps) => {
  return props.svgSource ? <SvgIcon {...props.svgSource} /> : props.fontSource ? <FontIcon {...props.fontSource} /> : null;
};
