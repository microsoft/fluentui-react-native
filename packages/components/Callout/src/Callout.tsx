import { requireNativeComponent } from 'react-native';
import { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { calloutName, ICalloutProps, ICalloutSlotProps, ICalloutType } from './Callout.types';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { composable } from '@uifabricshared/foundation-composable';

const RCTCallout = requireNativeComponent('RCTCallout');

export const Callout = composable<ICalloutType>({
  displayName: calloutName,
  usePrepareProps: (props: ICalloutProps, useStyling: IUseComposeStyling<ICalloutType>) => {
    const { componentRef, ...rest } = props;
    const calloutRef = useViewCommandFocus(componentRef);

    const slotProps = mergeSettings<ICalloutSlotProps>(useStyling(props), {
      root: {
        ref: calloutRef,
        ...rest
      }
    });

    return { slotProps };
  },
  slots: {
    root: RCTCallout
  }
});

export default Callout;
