/** @jsx withSlots */
import * as React from 'react';
import { View, Text } from 'react-native';
import {
  radioGroupName,
  IRadioGroupType,
  IRadioGroupProps,
  IRadioGroupState,
  IRadioGroupSlotProps,
  IRadioGroupRenderData
} from './RadioGroup.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { filterViewProps } from '../../utilities/RenderHelpers';
import { settings } from './RadioGroup.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens } from '../../tokens';
import { useAsRadioGroupSelection } from '../../hooks';

// Creates context to allow communication between its children components (RadioButtons)
export const RadioGroupContext = React.createContext({
  selectedKey: '',
  onButtonSelect: (key: string) => {
    return;
  }
});

export const RadioGroup = compose<IRadioGroupType>({
  displayName: radioGroupName,

  usePrepareProps: (userProps: IRadioGroupProps, useStyling: IUseComposeStyling<IRadioGroupType>) => {
    const { label, ariaLabel, ...rest } = userProps;

    // This hook updates the Selected Button and calls the customer's onClick function. This gets called after a button is pressed.
    const data = useAsRadioGroupSelection(userProps.defaultSelectedKey ? userProps.defaultSelectedKey : '', userProps.onChange);

    const state: IRadioGroupState = {
      selectedKey: data.selectedKey,
      onChange: data.onChange
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const ariaRoles = {
      accessibilityRole: 'radiogroup',
      accessibilityLabel: ariaLabel ? ariaLabel : label
    };

    const slotProps = mergeSettings<IRadioGroupSlotProps>(styleProps, {
      root: { rest, ...ariaRoles },
      label: { children: label },
      radioButtonContainer: rest
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<IRadioGroupSlotProps>, renderData: IRadioGroupRenderData, ...children: React.ReactNode[]) => {
    // This is necessary because renderData can be undefined, which causes problems in the return call.
    let key = 'Undefined';
    let onChangeCall = (key: string) => {
      return;
    };
    if (renderData.state != undefined) {
      key = renderData.state.selectedKey;
      onChangeCall = renderData.state.onChange;
    }

    return (
      <RadioGroupContext.Provider
        // Passes in the selected key and a hook function to update the newly selected button and call the client's onChange callback
        value={{
          selectedKey: key,
          onButtonSelect: onChangeCall
        }}
      >
        <Slots.root>
          <Slots.label />
          <Slots.radioButtonContainer>{children}</Slots.radioButtonContainer>
        </Slots.root>
      </RadioGroupContext.Provider>
    );
  },

  settings: settings,
  slots: {
    root: View,
    label: Text,
    radioButtonContainer: { slotType: View, filter: filterViewProps }
  },
  styles: {
    root: [],
    label: [foregroundColorTokens, textTokens],
    radioButtonContainer: []
  }
});

export default RadioGroup;
