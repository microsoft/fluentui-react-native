/** @jsxRuntime classic */
/** @jsx withSlots */
'use strict';
import * as React from 'react';
import { View, I18nManager } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import type { KeyPressEvent } from '@fluentui-react-native/interactive-hooks';
import { useAsPressable, useViewCommandFocus, useKeyDownProps } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';
import { foregroundColorTokens, textTokens, borderTokens, backgroundColorTokens, getPaletteFromTheme } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import { withSlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { settings, radioButtonSelectActionLabel } from './RadioButton.settings';
import type { IRadioButtonType, IRadioButtonProps, IRadioButtonSlotProps, IRadioButtonRenderData } from './RadioButton.types';
import { radioButtonName } from './RadioButton.types';
import { RadioGroupContext } from './RadioGroup';

enum DirectionalArrowKeys {
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
}

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
      accessibilityPositionInSet,
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

    // Explicitly only run on mount and unmount
    React.useEffect(() => {
      info.addRadioButtonKey(buttonKey);

      if (!disabled) {
        info.addRadioButtonEnabledKey(buttonKey);
      }

      return () => {
        info.removeRadioButtonKey(buttonKey);
        info.removeRadioButtonEnabledKey(buttonKey);
      };
    }, []);

    const isRTL = I18nManager.isRTL;

    const onInvoke = React.useCallback(
      (e: KeyPressEvent) => {
        if (e.nativeEvent.key in DirectionalArrowKeys) {
          const length = info.enabledButtonKeys.length;
          const next =
            e.nativeEvent.key === DirectionalArrowKeys.ArrowDown ||
            (isRTL ? e.nativeEvent.key === DirectionalArrowKeys.ArrowLeft : e.nativeEvent.key === DirectionalArrowKeys.ArrowRight);
          const currRadioButtonIndex = info.enabledButtonKeys.indexOf(info.selectedKey);
          let newCurrRadioButtonIndex;
          if (next) {
            newCurrRadioButtonIndex = (currRadioButtonIndex + 1) % length;
          } else {
            // previous
            newCurrRadioButtonIndex = (currRadioButtonIndex - 1 + length) % length;
          }
          info.onChange && info.onChange(info.enabledButtonKeys[newCurrRadioButtonIndex]);
          info.updateInvoked && info.updateInvoked(true);
        }
      },
      [info],
    );

    // Sets the updated selected button ref and focus if this Radio is selected via arrow key.
    React.useEffect(() => {
      if (info.invoked && buttonKey === info.selectedKey && !disabled) {
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
        componentRef?.current?.focus();
        info.updateInvoked && info.updateInvoked(false);
      }
    }, [info.invoked]);

    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];

    // Explicitly override onKeyDown to override the native behavior of moving focus with arrow keys.
    const onKeyDownProps = useKeyDownProps(onInvoke, ...keys);

    // Ensure focus is placed on button after click
    const changeSelectionWithFocus = () => {
      if (buttonKey != info.selectedKey) {
        info.onChange && info.onChange(buttonKey);
        info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
        info.updateInvoked && info.updateInvoked(true);
      }
    };

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
      selected: info.selectedKey === userProps.buttonKey && !disabled,
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
        accessibilityPositionInSet: accessibilityPositionInSet ?? ariaPosInSet ?? info.buttonKeys.findIndex((x) => x == buttonKey) + 1,
        accessibilitySetSize: accessibilitySetSize ?? ariaSetSize ?? info.buttonKeys.length,
        focusable: !state.disabled,
        onAccessibilityAction: onAccessibilityAction,
        ...onKeyDownProps,
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
