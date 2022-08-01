/** @jsx withSlots */
'use strict';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { radioName, RadioType, RadioProps, RadioSlotProps, RadioRenderData } from './Radio.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { filterViewProps } from '@fluentui-react-native/adapters';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { settings, radioSelectActionLabel } from './RadioButton.settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { foregroundColorTokens, textTokens, borderTokens, backgroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import { useAsPressable, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { RadioGroupContext } from './RadioGroup';

export const Radio = compose<RadioType>({
  displayName: radioName,

  usePrepareProps: (userProps: RadioProps, useStyling: IUseComposeStyling<RadioType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      label,
      value,
      disabled,
      accessibilityLabel,
      componentRef = defaultComponentRef,
      accessibilityPositionInSet,
      accessibilitySetSize,
      ...rest
    } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(RadioGroupContext);

    const buttonRef = useViewCommandFocus(componentRef);

    /* We don't want to call the user's onChange multiple times on the same selection. */
    const changeSelection = () => {
      if (value != info.selectedKey) {
        info.onChange && info.onChange(value);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    };

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (value == info.selectedKey) {
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    }, []);

    // Ensure focus is placed on button after click
    const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

    /* RadioButton changes selection when focus is moved between each RadioButton and on a click */
    const pressable = useAsPressable({
      ...rest,
      onPress: changeSelectionWithFocus,
      onFocus: changeSelection,
    });

    // Used when creating accessibility properties in mergeSettings below
    const onAccessibilityAction = React.useCallback(
      (event: { nativeEvent: { actionName: any } }) => {
        switch (event.nativeEvent.actionName) {
          case 'Select':
            changeSelection();
            break;
        }
      },
      [info, value],
    );

    const state = {
      ...pressable.state,
      selected: info.selectedKey === userProps.value,
      disabled: disabled || false,
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<RadioSlotProps>(styleProps, {
      root: {
        ...rest,
        ref: buttonRef,
        ...pressable.props,
        accessibilityRole: 'radio',
        accessibilityLabel: accessibilityLabel ?? label,
        accessibilityState: { disabled: state.disabled, selected: state.selected },
        accessibilityActions: [{ name: 'Select', label: radioSelectActionLabel }],
        accessibilityPositionInSet: accessibilityPositionInSet ?? info.buttonKeys.findIndex((x) => x == value) + 1,
        accessibilitySetSize: accessibilitySetSize ?? info.buttonKeys.length,
        focusable: !state.disabled,
        onAccessibilityAction: onAccessibilityAction,
      },
      content: { children: label },
    });

    return { slotProps };
  },

  render: (Slots: ISlots<RadioSlotProps>, _renderData: RadioRenderData, ...children: React.ReactNode[]) => {
    return (
      <Slots.root>
        <Slots.button>
          <Slots.innerCircle />
        </Slots.button>
        <Slots.label />
        {children}
      </Slots.root>
    );
  },

  settings,
  slots: {
    root: View,
    button: { slotType: View, filter: filterViewProps },
    innerCircle: { slotType: View, filter: filterViewProps },
    label: Text,
  },
  styles: {
    root: [],
    button: [borderTokens],
    innerCircle: [backgroundColorTokens],
    label: [foregroundColorTokens, textTokens, [{ source: 'textBorderColor', lookup: getPaletteFromTheme, target: 'borderColor' }]],
  },
});

export default Radio;
