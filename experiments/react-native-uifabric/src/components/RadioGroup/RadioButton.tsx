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
import { settings, selectedStyle, hoveredStyle, focusedStyle } from './RadioButton.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens } from '../../tokens';
import { useAsPressable } from '../../hooks';
import { RadioGroupContext } from './RadioGroup';

export const RadioButton = compose<IRadioButtonType>({
  displayName: radioButtonName,

  usePrepareProps: (userProps: IRadioButtonProps, useStyling: IUseComposeStyling<IRadioButtonType>) => {
    const { content, buttonKey, disabled, ariaLabel, ...rest } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(RadioGroupContext);

    const pressable = useAsPressable({
      ...rest
    });

    const state: IRadioButtonState = {
      ...pressable.state,
      selected: info.selectedKey == userProps.buttonKey ? true : false,
      disabled: disabled ? disabled : false
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
      if (!state.selected) info.onButtonSelect(buttonKey);
    };

    const accessibilityTraits = {
      accessibilityRole: 'radio',
      accessibilityLabel: ariaLabel ? ariaLabel : content,
      // Why are we able to do this? The radio button that's focused is always going to be the one selected. Therefore, unless it's disabled,
      // we can always set state=selected for the narrator, because every time the narrator is focused on a button, that's the one selected
      accessibilityStates: state.disabled ? ['disabled'] : ['selected'],
      accessibilityActions: [{ name: 'Select', label: 'Select a RadioButton' }],
      onAccessibilityAction: (event: { nativeEvent: { actionName: any } }) => {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            info.onButtonSelect(buttonKey);
        }
      }
    };

    //When the option is disabled, there's no built-in disable functionality for React-Native. So here's the logic I implemented for it.
    const rootProps = state.disabled
      ? { rest, ...accessibilityTraits }
      : {
          ...pressable.props,
          ...accessibilityTraits,
          rest,
          onFocus: onFocusChange
        };
    const buttonProps = state.disabled ? { rest, style: { borderColor: 'grey' } } : rest;

    let contentProps = {};
    if (state.disabled) {
      contentProps = { children: content, style: { color: 'grey' } };
    } else if (state.focused) {
      contentProps = { children: content, style: focusedStyle };
    } else {
      contentProps = { children: content };
    }

    // This handles the hovered/pressed UI functionality
    let innerCircleProps = {};
    if (state.selected) {
      innerCircleProps = selectedStyle;
    } else if (state.hovered || state.focused) {
      innerCircleProps = hoveredStyle;
    } else {
      innerCircleProps = rest;
    }

    const slotProps = mergeSettings<IRadioButtonSlotProps>(styleProps, {
      root: rootProps,
      button: buttonProps,
      innerCircle: innerCircleProps,
      content: contentProps
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<IRadioButtonSlotProps>, renderData: IRadioButtonRenderData, ...children: React.ReactNode[]) => {
    return (
      <RadioGroupContext.Consumer>
        {context => (
          <Slots.root>
            <Slots.button>
              <Slots.innerCircle />
            </Slots.button>
            <Slots.content />
            {children}
          </Slots.root>
        )}
      </RadioGroupContext.Consumer>
    );
  },

  settings: settings,
  slots: {
    root: View,
    button: { slotType: View, filter: filterViewProps },
    innerCircle: { slotType: View, filter: filterViewProps },
    content: Text
  },
  styles: {
    root: [],
    button: [],
    innerCircle: [],
    content: [foregroundColorTokens, textTokens]
  }
});

export default RadioButton;
