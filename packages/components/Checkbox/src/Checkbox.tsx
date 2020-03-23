/** @jsx withSlots */
import * as React from 'react';
import { View, Text } from 'react-native';
import { ICheckboxState, ICheckboxProps, ICheckboxSlotProps, ICheckboxRenderData, ICheckboxType, checkboxName } from './Checkbox.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { settings } from './Checkbox.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens } from '@fluentui-react-native/tokens';
import { useAsPressable, useAsToggle, useViewCommandFocus, useKeyCallback } from '@fluentui-react-native/interactive-hooks';
import { backgroundColorTokens } from '@fluentui-react-native/tokens';

export const Checkbox = compose<ICheckboxType>({
  displayName: checkboxName,

  usePrepareProps: (userProps: ICheckboxProps, useStyling: IUseComposeStyling<ICheckboxType>) => {
    const { ariaLabel, checked, defaultChecked, boxSide, disabled, label, onChange, ...rest } = userProps;

    // Warns defaultChecked and checked being mutually exclusive.
    if (defaultChecked != undefined && checked != undefined) {
      console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
    }

    // Used for uncontrolled Checkbox's to keep internal state
    const data = useAsToggle(defaultChecked, checked, onChange);

    const pressable = useAsPressable({ onPress: data.onChange, ...rest });

    const buttonRef = useViewCommandFocus(userProps.componentRef);

    // Handles the "Space" key toggling the Checkbox
    const onKeyUpSpace = useKeyCallback(' ', data.onChange);

    const state: ICheckboxState = {
      ...pressable.state,
      disabled,
      checked: data.state.isChecked,
      boxAtEnd: boxSide == undefined || boxSide == 'start' ? false : true
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const allyStates = state.disabled ? ['disabled'] : undefined;

    const slotProps = mergeSettings<ICheckboxSlotProps>(styleProps, {
      root: {
        rest,
        ref: buttonRef,
        ...pressable.props,
        accessibilityRole: 'checkbox',
        accessibilityLabel: ariaLabel || label,
        accessibilityStates: allyStates,
        onKeyUp: onKeyUpSpace
      },
      // Temporary checkmark until SVG functionality
      checkmark: { children: '✓' },
      content: { children: label }
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<ICheckboxSlotProps>, renderData: ICheckboxRenderData, ...children: React.ReactNode[]) => {
    return (
      <Slots.root>
        {renderData.state && renderData.state.boxAtEnd && <Slots.content />}
        <Slots.checkbox>
          <Slots.checkmark />
        </Slots.checkbox>
        {renderData.state && !renderData.state.boxAtEnd && <Slots.content />}
        {children}
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: View,
    checkbox: { slotType: View, filter: filterViewProps },
    checkmark: Text,
    content: Text
  },
  styles: {
    root: [],
    checkbox: [backgroundColorTokens, borderTokens],
    checkmark: [foregroundColorTokens],
    content: [foregroundColorTokens, textTokens]
  }
});

export default Checkbox;
