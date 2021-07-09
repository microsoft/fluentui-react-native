import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import * as React from 'react';
import { findNodeHandle } from 'react-native';
import { settings } from './Callout.settings';
import { calloutName, ICalloutProps, ICalloutSlotProps, ICalloutType } from './Callout.types';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const RCTCallout = ensureNativeComponent('RCTCallout');

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
    root: RCTCallout,
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
  },
});

export default Callout;
