/** @jsx withSlots */
'use strict';
import * as React from 'react';
import { View, Text, NativeSyntheticEvent } from 'react-native';
import {
  radioButtonName,
  IRadioButtonType,
  IRadioButtonProps,
  IRadioButtonState,
  IRadioButtonSlotProps,
  IRadioButtonRenderData
} from './RadioButton.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps } from '../../utilities/RenderHelpers';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings } from './RadioButton.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens, backgroundColorTokens } from '../../tokens';
import { useAsPressable } from '../../hooks';
import { RadioGroupContext } from './RadioGroup';

export const RadioButton = compose<IRadioButtonType>({
  displayName: radioButtonName,

  usePrepareProps: (userProps: IRadioButtonProps, useStyling: IUseComposeStyling<IRadioButtonType>) => {
    const { content, buttonKey, disabled, ariaLabel, ...rest } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(RadioGroupContext);

    const pressable = useAsPressable(rest);

    const state: IRadioButtonState = {
      ...pressable.state,
      selected: info.selectedKey === userProps.buttonKey,
      disabled: disabled || false
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    // This function is called every time a RadioButton gains focus. It does two things:
    // 1) Calls pressable's onFocus in order to keep track of our state's focus variable. It is dependent on pressable's
    //    focus variable. Without this, it wouldn't stay updated because we're overriding it's onFocus below for the rootProps.
    // 2) Selects the currently focused button by calling the RadioGroup's callback function.
    const onFocusChange = (ev: NativeSyntheticEvent<{}>) => {
      pressable.props.onFocus && pressable.props.onFocus(ev);
      // This check is necessary because this func gets called even when a button loses focus (not sure why?) which then calls the client's onChange multiple times
      if (!state.selected) {
        info.onChange(buttonKey);
      }
    };

    let accessibilityStates: string[] = [];
    if (state.disabled) {
      accessibilityStates = ['disabled'];
    } else if (state.selected) {
      accessibilityStates = ['selected'];
    }

    const slotProps = mergeSettings<IRadioButtonSlotProps>(styleProps, {
      root: {
        rest,
        ...pressable.props,
        onFocus: onFocusChange,
        accessibilityRole: 'radio',
        accessibilityLabel: content,
        accessibilityStates: accessibilityStates,
        accessibilityActions: [{ name: 'Select', label: 'Select a RadioButton' }],
        onAccessibilityAction: React.useCallback((event: { nativeEvent: { actionName: any } }) => {
          switch (event.nativeEvent.actionName) {
            case 'Select':
              info.onChange(buttonKey);
          }
        }, [])
      },
      content: { children: content }
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<IRadioButtonSlotProps>, renderData: IRadioButtonRenderData, ...children: React.ReactNode[]) => {
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
    content: Text
  },
  styles: {
    root: [],
    button: [borderTokens],
    innerCircle: [backgroundColorTokens],
    content: [foregroundColorTokens, textTokens]
  }
});

export default RadioButton;
