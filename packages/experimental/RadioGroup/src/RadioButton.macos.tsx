/** @jsx withSlots */
import * as React from 'react';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { RadioGroupContext } from './RadioGroup';
import { radioName, RadioProps, RadioSlotProps, RadioType } from './Radio.types';

const NativeRadioButtonView = ensureNativeComponent('FRNRadioButtonView');

export const RadioButton = compose<RadioType>({
  displayName: radioName,
  usePrepareProps: (userProps: RadioProps, useStyling: IUseComposeStyling<RadioType>) => {
    const defaultComponentRef = React.useRef(null);
    const { label, value, disabled, componentRef = defaultComponentRef } = userProps;
    const info = React.useContext(RadioGroupContext);

    // Reroute the native component's onPress event to RadioGroup's onChange
    const onPressRerouted = () => {
      // Prevent calls to RadioGroup's onChange on the currently selected button
      if (value != info.value) {
        info.onChange && info.onChange(value);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    };

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (value === info.value) {
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    }, []);

    const styleProps = useStyling(userProps);
    const isSelected = info.value === value;
    const slotProps = mergeSettings<RadioSlotProps>(styleProps, {
      root: {
        ref: componentRef,
        buttonKey: value,
        content: label,
        disabled: disabled,
        onPress: onPressRerouted,
        selected: isSelected,
        style: {
          // Fluent controls are designed to snap to a 4 px grid
          marginLeft: 4,
          marginTop: 4,
          minWidth: 20,
          minHeight: 20,
        },
      },
    });

    return { slotProps };
  },
  slots: {
    root: NativeRadioButtonView,
  },
  styles: {
    root: [],
  },
  render: (Slots: ISlots<RadioSlotProps>) => {
    return <Slots.root />;
  },
});

export default RadioButton;
