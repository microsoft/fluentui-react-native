import * as React from 'react';
import { findNodeHandle, Platform } from 'react-native';

import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings } from './Callout.settings';
import type { ICalloutProps, ICalloutSlotProps, ICalloutType } from './Callout.types';
import { calloutName } from './Callout.types';

const NativeCalloutView = Platform.select({
  macos: ensureNativeComponent('FRNCallout'),
  default: ensureNativeComponent('RCTCallout'), // win32
});

export const Callout = compose<ICalloutType>({
  displayName: calloutName,
  usePrepareProps: (props: ICalloutProps, useStyling: IUseComposeStyling<ICalloutType>) => {
    const { componentRef, target, ...rest } = props;
    const calloutRef = useViewCommandFocus(componentRef);
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

    const slotProps = mergeSettings<ICalloutSlotProps>(useStyling(props), {
      root: {
        ref: calloutRef,
        ...(nativeTarget && { target: nativeTarget }),
        ...rest,
      },
    });

    return { slotProps };
  },
  settings: settings,
  slots: {
    root: NativeCalloutView,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
  },
});

export default Callout;
