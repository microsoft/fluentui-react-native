/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { ICheckboxState, ICheckboxProps, ICheckboxSlotProps, ICheckboxRenderData, ICheckboxType, checkboxName } from './Checkbox.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { settings, checkboxSelectActionLabel } from './Checkbox.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import {
  useAsToggle,
  useAsPressable,
  useViewCommandFocus,
  useKeyCallback,
  useOnPressWithFocus,
} from '@fluentui-react-native/interactive-hooks';
import { backgroundColorTokens } from '@fluentui-react-native/tokens';
import { IPressableProps } from '@fluentui-react-native/pressable';

export const Checkbox = compose<ICheckboxType>({
  displayName: checkboxName,

  usePrepareProps: (userProps: ICheckboxProps, useStyling: IUseComposeStyling<ICheckboxType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      accessibilityLabel,
      ariaLabel,
      checked,
      defaultChecked,
      boxSide,
      disabled,
      label,
      onChange,
      componentRef = defaultComponentRef,
      ...rest
    } = userProps;

    // Warns defaultChecked and checked being mutually exclusive.
    if (defaultChecked != undefined && checked != undefined) {
      console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
    }

    // Re-usable hook for toggle components.
    const [isChecked, toggleChecked] = useAsToggle(defaultChecked, checked, onChange);

    // Ensure focus is placed on checkbox after click
    const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleChecked);

    const pressable = useAsPressable({ onPress: toggleCheckedWithFocus, ...(rest as IPressableProps) });

    const buttonRef = useViewCommandFocus(componentRef);

    // Handles the "Space" key toggling the Checkbox
    const onKeyUpSpace = useKeyCallback(toggleChecked, ' ');

    const state: ICheckboxState = {
      ...pressable.state,
      disabled: !!disabled,
      checked: isChecked,
      boxAtEnd: boxSide == undefined || boxSide == 'start' ? false : true,
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

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

    const slotProps = mergeSettings<ICheckboxSlotProps>(styleProps, {
      root: {
        rest,
        ref: buttonRef,
        ...pressable.props,
        accessibilityRole: 'checkbox',
        accessibilityLabel: accessibilityLabel ?? ariaLabel ?? label,
        accessibilityState: { disabled: state.disabled, checked: state.checked },
        accessibilityActions: [{ name: 'Toggle', label: checkboxSelectActionLabel }],
        onAccessibilityAction: onAccessibilityAction,
        onKeyUp: onKeyUpSpace,
      },
      // Temporary checkmark until SVG functionality
      checkmark: { children: '✓' },
      content: { children: label },
    });

    return { slotProps, state };
  },

  render: (Slots: ISlots<ICheckboxSlotProps>, renderData: ICheckboxRenderData, ...children: React.ReactNode[]) => {
    return (
      <Slots.root>
        {renderData?.state.boxAtEnd && <Slots.content />}
        <Slots.checkbox>
          <Slots.checkmark />
        </Slots.checkbox>
        {!renderData?.state.boxAtEnd && <Slots.content />}
        {children}
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: View,
    checkbox: { slotType: View, filter: filterViewProps },
    checkmark: Text,
    content: Text,
  },
  styles: {
    root: [],
    checkbox: [
      backgroundColorTokens,
      borderTokens,
      [
        { source: 'checkboxBackgroundColor', lookup: getPaletteFromTheme, target: 'backgroundColor' },
        { source: 'checkboxBorderColor', lookup: getPaletteFromTheme, target: 'borderColor' },
      ],
    ],
    checkmark: [
      foregroundColorTokens,
      [
        { source: 'checkmarkColor', lookup: getPaletteFromTheme, target: 'color' },
        { source: 'checkmarkVisibility', target: 'opacity' },
      ],
    ],
    content: [foregroundColorTokens, textTokens, [{ source: 'textBorderColor', lookup: getPaletteFromTheme, target: 'borderColor' }]],
  },
});

export default Checkbox;
