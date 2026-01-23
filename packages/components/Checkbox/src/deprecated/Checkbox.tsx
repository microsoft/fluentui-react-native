/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { View } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import {
  useAsToggle,
  useAsPressable,
  useViewCommandFocus,
  useKeyProps,
  useOnPressWithFocus,
} from '@fluentui-react-native/interactive-hooks';
import type { IPressableProps } from '@fluentui-react-native/pressable';
import { Text } from '@fluentui-react-native/text';
import { foregroundColorTokens, textTokens, borderTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { backgroundColorTokens } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings, checkboxSelectActionLabel } from './Checkbox.settings';
import type { ICheckboxState, ICheckboxProps, ICheckboxSlotProps, ICheckboxRenderData, ICheckboxType } from './Checkbox.types';
import { checkboxName } from './Checkbox.types';

/**
 * @deprecated This will be removed when the package moves to 1.0.0.
 * Please see MIGRATION.md for details on how to move to the new Checkbox.
 */
export const Checkbox = compose<ICheckboxType>({
  displayName: checkboxName,

  usePrepareProps: (userProps: ICheckboxProps, useStyling: IUseComposeStyling<ICheckboxType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      accessible,
      accessibilityLabel,
      accessibilityRole,
      ariaLabel,
      checked,
      defaultChecked,
      boxSide,
      label,
      onChange,
      componentRef = defaultComponentRef,
      focusable,
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
    const onKeyProps = useKeyProps(toggleChecked, ' ');

    const state: ICheckboxState = {
      ...pressable.state,
      disabled: !!userProps.disabled,
      checked: isChecked,
      boxAtEnd: !(boxSide == undefined || boxSide == 'start'),
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
        accessible: accessible ?? true,
        accessibilityRole: accessibilityRole ?? 'checkbox',
        accessibilityLabel: accessibilityLabel ?? label,
        accessibilityState: { disabled: state.disabled, checked: state.checked },
        accessibilityActions: [{ name: 'Toggle', label: checkboxSelectActionLabel }],
        focusable: focusable ?? !state.disabled,
        onAccessibilityAction: onAccessibilityAction,
        enableFocusRing: false,
        ...onKeyProps,
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
