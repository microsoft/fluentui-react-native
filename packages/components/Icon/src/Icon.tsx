import * as React from 'react';

import { FontIcon } from './FontIcon/FontIcon';
import type { IconProps } from './Icon.types';
import { SvgIcon } from './SvgIcon/SvgIcon';
export const Icon = (props: IconProps) => {
  return props.svgSource ? <SvgIcon {...props.svgSource} /> : props.fontSource ? <FontIcon {...props.fontSource} /> : null;
};
