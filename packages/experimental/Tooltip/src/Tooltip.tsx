import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';

import type { TooltipProps } from './Tooltip.types';
import { tooltipName } from './Tooltip.types';
import NativeTooltipView from './TooltipNativeComponent';

export const Tooltip = stagedComponent((props: TooltipProps) => {
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

  const TooltipComponent = (rest: TooltipProps, children: React.ReactNode) => {
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
