/** @jsx withSlots */
import * as React from 'react';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { RadioGroupContext } from './RadioGroup';
import { radioButtonName, IRadioButtonProps, IRadioButtonSlotProps, IRadioButtonType } from './RadioButton.types';

const NativeRadioButtonView = ensureNativeComponent('FRNRadioButtonView');

export const RadioButton = compose<IRadioButtonType>({
  displayName: radioButtonName,
  usePrepareProps: (userProps: IRadioButtonProps, useStyling: IUseComposeStyling<IRadioButtonType>) => {
    const { content, buttonKey, disabled } = userProps;
    const info = React.useContext(RadioGroupContext);
    // Reroute the native component's onPress event to RadioGroup's onChange
    const onPressRerouted = () => {
      // Prevent calls to RadioGroup's onChange on the currently selected button
      if (buttonKey != info.selectedKey) {
        info.onChange && info.onChange(buttonKey);
      }
    };

    const styleProps = useStyling(userProps);
    const isSelected = info.selectedKey === buttonKey;
    const slotProps = mergeSettings<IRadioButtonSlotProps>(styleProps, {
      root: {
        buttonKey: buttonKey,
        content: content,
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
  render: (Slots: ISlots<IRadioButtonSlotProps>) => {
    return <Slots.root />;
  },
});

export default RadioButton;
