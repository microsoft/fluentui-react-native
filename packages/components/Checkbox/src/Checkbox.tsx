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
import { useAsPressable, useAsToggleCheckbox } from '@fluentui-react-native/interactive-hooks';
import { IKeyboardEvent } from '@office-iss/react-native-win32';
import { backgroundColorTokens } from '@fluentui-react-native/tokens';

export const Checkbox = compose<ICheckboxType>({
  displayName: checkboxName,

  usePrepareProps: (userProps: ICheckboxProps, useStyling: IUseComposeStyling<ICheckboxType>) => {
    const { ariaLabel, checked, defaultChecked, boxSide, disabled, label, onChange, ...rest } = userProps;

    // Used for uncontrolled Checkbox's to keep internal state
    const data = useAsToggleCheckbox(defaultChecked || false, onChange);

    const pressable = useAsPressable({ onPress: data.onChange, ...rest });

    const state: ICheckboxState = {
      info: {
        ...pressable.state,
        disabled,
        checked: checked != undefined ? checked : data.checked,
        // To allow overrides in .settings. 'start' || undefined = false and 'end' = true
        boxSide: boxSide == undefined || boxSide == 'start' ? false : true
      }
    };

    const onKeyUp = React.useCallback(
      (args: IKeyboardEvent) => {
        if (args.nativeEvent.key == ' ') {
          data.onChange();
        }
      },
      [userProps]
    );

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state.info[override] || userProps[override]);

    // TO DO: Add ally states.
    // let accessibilityStates: string[] = undefined;
    // if (state.info.disabled) {
    //   accessibilityStates = ['disabled'];
    // } else if (state.info.checked) {
    //   accessibilityStates = ['checked'];
    // } else {
    //   accessibilityStates = ['unchecked'];
    // }

    const allyStates = state.info.disabled ? ['disabled'] : undefined;

    const slotProps = mergeSettings<ICheckboxSlotProps>(styleProps, {
      root: {
        rest,
        ...pressable.props,
        accessibilityRole: 'checkbox',
        accessibilityLabel: ariaLabel || label,
        accessibilityStates: allyStates,
        onKeyUp: onKeyUp
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
        {renderData.state && renderData.state.info.boxSide && <Slots.content />}
        <Slots.checkbox>
          <Slots.checkmark />
        </Slots.checkbox>
        {renderData.state && !renderData.state.info.boxSide && <Slots.content />}
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
