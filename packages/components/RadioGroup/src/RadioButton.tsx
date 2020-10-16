/** @jsx withSlots */
'use strict';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { radioButtonName, IRadioButtonType, IRadioButtonProps, IRadioButtonSlotProps, IRadioButtonRenderData } from './RadioButton.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings, radioButtonSelectActionLabel } from './RadioButton.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens, backgroundColorTokens, getPaletteFromTheme} from '@fluentui-react-native/tokens';
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { RadioGroupContext } from './RadioGroup';

export const RadioButton = compose<IRadioButtonType>({
  displayName: radioButtonName,

  usePrepareProps: (userProps: IRadioButtonProps, useStyling: IUseComposeStyling<IRadioButtonType>) => {
    const { content, buttonKey, disabled, ariaLabel, componentRef, ...rest } = userProps;

    // Since we're overriding pressable's onFocus below, pressable.state.focused does not get updated.
    // We need to track whether the RadioButton is focused or not manually.
    const [isButtonFocused, setIsFocused] = React.useState(false);

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(RadioGroupContext);

    const pressable = useAsPressable(rest);

    const buttonRef = useViewCommandFocus(componentRef);

    // Used when creating accessibility properties in mergeSettings below
    const onAccessibilityAction = React.useCallback(
      (event: { nativeEvent: { actionName: any } }) => {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            info.onChange && info.onChange(buttonKey);
            break;
        }
      },
      [info, buttonKey],
    );

    const state = {
      ...pressable.state,
      selected: info.selectedKey === userProps.buttonKey,
      disabled: disabled || false,
      focused: isButtonFocused
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    // This function is called every time a RadioButton gains focus. It does two things:
    // 1) Calls pressable's onFocus in order to keep track of our state's focus variable. It is dependent on pressable's
    //    focus variable. Without this, it wouldn't stay updated because we're overriding it's onFocus below for the rootProps.
    // 2) Selects the currently focused button by calling the RadioGroup's callback function.
    const onFocusChange = React.useCallback((/* ev: NativeSyntheticEvent<{}> */) => {
      // This check is necessary because this func gets called even when a button loses focus (not sure why?) which then calls the client's onChange multiple times
      if (!state.selected) {
        info.onChange && info.onChange(buttonKey);
      }
      setIsFocused(true);
    }, [state, pressable.props, info, buttonKey]);

    const slotProps = mergeSettings<IRadioButtonSlotProps>(styleProps, {
      root: {
        rest,
        ref: buttonRef,
        ...pressable.props,
        onFocus: onFocusChange,
        onBlur: () => setIsFocused(false),
        accessibilityRole: 'radio',
        accessibilityLabel: ariaLabel ? ariaLabel : content,
        accessibilityState: { disabled: state.disabled, selected: state.selected },
        accessibilityActions: [{ name: 'Select', label: radioButtonSelectActionLabel }],
        onAccessibilityAction: onAccessibilityAction,
      },
      content: { children: content },
    });

    return { slotProps };
  },

  render: (Slots: ISlots<IRadioButtonSlotProps>, _renderData: IRadioButtonRenderData, ...children: React.ReactNode[]) => {
    return (
      <Slots.root>
        <Slots.button>
          <Slots.innerCircle />
        </Slots.button>
        <Slots.content />
        {children}
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: View,
    button: { slotType: View, filter: filterViewProps },
    innerCircle: { slotType: View, filter: filterViewProps },
    content: Text,
  },
  styles: {
    root: [],
    button: [borderTokens],
    innerCircle: [backgroundColorTokens],
    content: [foregroundColorTokens, textTokens, [{ source: 'textBorderColor', lookup: getPaletteFromTheme, target: 'borderColor' }]],
  },
});

export default RadioButton;
