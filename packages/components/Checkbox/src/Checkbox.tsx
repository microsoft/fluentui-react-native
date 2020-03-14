/** @jsx withSlots */
import * as React from 'react';
import { View, Text } from 'react-native';
import { ICheckboxState, ICheckboxProps, ICheckboxSlotProps, ICheckboxRenderData, ICheckboxType, checkboxName } from './Checkbox.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { filterViewProps } from '@fluentui-native/adapters';
import { settings } from './Checkbox.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens } from '@fluentui-native/tokens';
import { useAsPressable, useAsToggleCheckbox } from '@fluentui-native/interactive-hooks';
import { IKeyboardEvent } from '@office-iss/react-native-win32';
import { backgroundColorTokens } from '@fluentui-native/tokens';

export const Checkbox = compose<ICheckboxType>({
  displayName: checkboxName,

  usePrepareProps: (userProps: ICheckboxProps, useStyling: IUseComposeStyling<ICheckboxType>) => {
    const { ariaLabel, checked, defaultChecked, boxSide, disabled, label, ...rest } = userProps;

    // Used for uncontrolled Checkbox's to keep internal state
    const data = useAsToggleCheckbox(defaultChecked || false);

    // On press of a checkbox, call state hook and call client's onChange()
    const onToggle = React.useCallback(() => {
      data.onChange();
      userProps.onChange && userProps.onChange(!data.checked);
    }, [data, userProps]);

    const pressable = useAsPressable({ onPress: onToggle, ...rest });

    const state: ICheckboxState = {
      info: {
        ...pressable.state,
        disabled: disabled || false,
        checked: checked != undefined ? checked : data.checked,
        // To allow overrides in .settings. 'start' || undefined = false and 'end' = true
        boxSide: boxSide == undefined || boxSide == 'start' ? false : true
      }
    };

    // const onKeyDown = React.useCallback(
    //   (args: IKeyboardEvent) => {
    //     // Allows user to toggle checkbox by pressing the Space key
    //     if (args.nativeEvent.key == ' ') {
    //       pressable.props.onPress();
    //     }
    //   },
    //   [userProps]
    // );

    const onKeyUp = React.useCallback(
      (args: IKeyboardEvent) => {
        if (args.nativeEvent.key == ' ') {
          onToggle();
        }
      },
      [userProps]
    );

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);

    // TO DO: Add ally states.
    // let accessibilityStates: string[] = [];
    // if (state.info.disabled) {
    //   accessibilityStates = ['disabled'];
    // } else if (state.info.checked) {
    //   accessibilityStates = ['checked'];
    // }

    const allyStates = state.info.disabled ? ['disabled'] : [];

    const slotProps = mergeSettings<ICheckboxSlotProps>(styleProps, {
      root: {
        rest,
        ...pressable.props,
        accessibilityRole: 'checkbox',
        accessibilityLabel: ariaLabel ? ariaLabel : label,
        accessibilityStates: allyStates,
        // onKeyDown: onKeyDown,
        onKeyUp: onKeyUp
        // TO DO: Add Actions
        // Actions: 'Select' and "RemoveFromSelection"
      },
      // Temporary checkmark until SVG functionality
      checkmark: { children: '✓' },
      content: { children: label }
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<ICheckboxSlotProps>, renderData: ICheckboxRenderData, ...children: React.ReactNode[]) => {
    if (renderData.state && renderData.state.info.boxSide == false) {
      return (
        <Slots.root>
          <Slots.checkbox>
            <Slots.checkmark />
          </Slots.checkbox>
          <Slots.content />
          {children}
        </Slots.root>
      );
    } else {
      return (
        <Slots.root>
          <Slots.content />
          <Slots.checkbox>
            <Slots.checkmark />
          </Slots.checkbox>
          {children}
        </Slots.root>
      );
    }
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
