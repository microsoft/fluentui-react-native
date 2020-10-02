/** @jsx withSlots */
import * as React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { CheckboxState, CheckboxProps, CheckboxType, checkboxName, CheckboxTokens } from './Checkbox.types';
import { stylingSettings, checkboxSelectActionLabel } from './Checkbox.settings';
import { useAsToggle, useAsPressable, useViewCommandFocus, useKeyCallback } from '@fluentui-react-native/interactive-hooks';
import { compose, mergeProps, UseSlots, withSlots, UseStylingParam } from '@fluentui-react-native/framework';
import { filterViewProps } from '@fluentui-react-native/adapters';
import {} from '@fluentui-react-native/use-styling';

const accessibilityActions = [{ name: 'Toggle', label: checkboxSelectActionLabel }];

export const Checkbox = compose<CheckboxType>({
  displayName: checkboxName,
  ...stylingSettings,
  slots: {
    root: View,
    checkbox: View,
    checkmark: Text,
    content: Text,
  },
  filters: {
    root: filterViewProps,
  },
  render: (userProps: CheckboxProps, useSlots: UseSlots<CheckboxType>) => {
    const { checked, defaultChecked, boxSide, disabled, onChange, ...rest } = userProps;

    // Warns defaultChecked and checked being mutually exclusive.
    if (defaultChecked != undefined && checked != undefined) {
      console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
    }

    // Re-usable hook for toggle components.
    const [isChecked, toggleChecked] = useAsToggle(defaultChecked, checked, onChange);
    const pressable = useAsPressable({ onPress: toggleChecked, ...rest });
    const buttonRef = useViewCommandFocus(userProps.componentRef);

    // Handles the "Space" key toggling the Checkbox
    const onKeyUpSpace = useKeyCallback(' ', toggleChecked);

    const state: CheckboxState = { ...pressable.state, disabled, checked: isChecked };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const useSlotsParam: UseStylingParam<CheckboxTokens> = { hasState: (override: string) => state[override] };
    const Slots = useSlots(userProps, useSlotsParam);

    // grab the value for checkmark text from the tokens
    const checkmarkText = useSlotsParam.tokens.checkmarkText;

    // Used when creating accessibility properties in mergeSettings below
    const onAccessibilityAction = React.useCallback(
      (event: { nativeEvent: { actionName: any } }) => {
        switch (event.nativeEvent.actionName) {
          case 'Toggle':
            toggleChecked();
            break;
        }
      },
      [toggleChecked, userProps, state, pressable.props],
    );

    // create the accessibility state, it's an object so memo it
    const accessibilityState = React.useMemo(() => ({ disabled, checked }), [disabled, checked]);

    return (extra: CheckboxProps, children: React.ReactNode) => {
      const { ariaLabel, label, ...final } = mergeProps(userProps, extra, pressable.props);
      return (
        <Slots.root
          {...{ ref: buttonRef, onKeyUp: onKeyUpSpace }}
          accessibilityRole="checkbox"
          accessibilityLabel={ariaLabel || label}
          accessibilityState={accessibilityState}
          accessibilityActions={accessibilityActions as ViewProps['accessibilityActions']}
          onAccessibilityAction={onAccessibilityAction}
          {...final}
        >
          {boxSide === 'end' && <Slots.content>{label}</Slots.content>}
          <Slots.checkbox>
            <Slots.checkmark>{checkmarkText}</Slots.checkmark>
          </Slots.checkbox>
          {boxSide !== 'end' && <Slots.content>{label}</Slots.content>}
          {children}
        </Slots.root>
      );
    };
  },
});

export default Checkbox;
