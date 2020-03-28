import { requireNativeComponent } from 'react-native';
import { calloutName, ICalloutProps, ICalloutSlotProps, ICalloutType } from './Callout.types';
import { settings } from './Callout.settings';
import { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { compose } from '@uifabricshared/foundation-compose';

const RCTCallout = requireNativeComponent('RCTCallout');

export const Callout = compose<ICalloutType>({
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
  settings: settings,
  slots: {
    root: RCTCallout
  },
  styles: {
    root: [backgroundColorTokens, borderTokens]
  }
});

export default Callout;
