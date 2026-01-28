/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { TooltipProps } from './Tooltip.types';
import { tooltipName } from './Tooltip.types';
import NativeTooltipView from './TooltipNativeComponent';

export const Tooltip = phasedComponent((props: TooltipProps) => {
  const { target } = props;

  const [nativeTarget, setNativeTarget] = React.useState<number | string | null>(null);

  React.useLayoutEffect(() => {
    if (typeof target === 'string') {
      // Pass string type `target` directly
      setNativeTarget(target);
    } else if (target?.current) {
      // Pass the tagID for a valid ref `target`
      setNativeTarget(findNodeHandle(target.current));
    } else {
      // Clear `target` so we may fall back on `anchorRect` if provided
      setNativeTarget(null);
    }
  }, [target]);

  const TooltipComponent = (innerProps: TooltipProps) => {
    const { children, ...rest } = innerProps;
    return (
      <NativeTooltipView {...(nativeTarget && { target: nativeTarget })} {...mergeProps(props, rest)}>
        {children}
      </NativeTooltipView>
    );
  };

  return TooltipComponent;
});

Tooltip.displayName = tooltipName;

export default Tooltip;
