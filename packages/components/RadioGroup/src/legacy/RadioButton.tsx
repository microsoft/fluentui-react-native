/** @jsxImportSource @fluentui-react-native/framework-base */
'use strict';
import * as React from 'react';
import { View } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import { useAsPressable, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';
import { foregroundColorTokens, textTokens, borderTokens, backgroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings, radioButtonSelectActionLabel } from './RadioButton.settings';
import type { IRadioButtonType, IRadioButtonProps, IRadioButtonSlotProps, IRadioButtonRenderData } from './RadioButton.types';
import { radioButtonName } from './RadioButton.types';
import { RadioGroupContext } from './RadioGroup';

export const RadioButton = compose<IRadioButtonType>({
  displayName: radioButtonName,

  usePrepareProps: (userProps: IRadioButtonProps, useStyling: IUseComposeStyling<IRadioButtonType>) => {
    const defaultComponentRef = React.useRef(null);
    const {
      content,
      buttonKey,
      disabled,
      accessibilityLabel,
      ariaLabel,
      componentRef = defaultComponentRef,
      accessibilityPosInSet,
      ariaPosInSet,
      accessibilitySetSize,
      ariaSetSize,
      ...rest
    } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(RadioGroupContext);

    const buttonRef = useViewCommandFocus(componentRef);

    /* We don't want to call the user's onChange multiple times on the same selection. */
    const changeSelection = () => {
      if (buttonKey != info.selectedKey) {
        info.onChange && info.onChange(buttonKey);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
      }
    };

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (buttonKey == info.selectedKey) {
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
      [info, buttonKey],
    );

    const state = {
      ...pressable.state,
      selected: info.selectedKey === userProps.buttonKey,
      disabled: disabled || false,
    };

    // Grab the styling information from the userProps, referencing the state as well as the props.
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<IRadioButtonSlotProps>(styleProps, {
      root: {
        ...rest,
        ref: buttonRef,
        ...pressable.props,
        accessibilityRole: 'radio',
        accessibilityLabel: accessibilityLabel ?? ariaLabel ?? content,
        accessibilityState: { disabled: state.disabled, selected: state.selected },
        accessibilityActions: [{ name: 'Select', label: radioButtonSelectActionLabel }],
        accessibilityPosInSet: accessibilityPosInSet ?? ariaPosInSet ?? info.buttonKeys.findIndex((x) => x == buttonKey) + 1,
        accessibilitySetSize: accessibilitySetSize ?? ariaSetSize ?? info.buttonKeys.length,
        focusable: !state.disabled,
        onAccessibilityAction: onAccessibilityAction,
      },
      content: { children: content },
    });

    return { slotProps };
  },

  render: (Slots: ISlots<IRadioButtonSlotProps>, _renderData: IRadioButtonRenderData, ...children: React.ReactNode[]) => {
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
    content: Text,
  },
  styles: {
    root: [],
    button: [borderTokens],
    innerCircle: [backgroundColorTokens],
    content: [foregroundColorTokens, textTokens, [{ source: 'textBorderColor', lookup: getPaletteFromTheme, target: 'borderColor' }]],
  },
});

export default RadioButton;
