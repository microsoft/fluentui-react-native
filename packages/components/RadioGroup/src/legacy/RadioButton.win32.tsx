/** @jsxImportSource @fluentui-react-native/framework-base */
'use strict';
import * as React from 'react';
import { View, I18nManager } from 'react-native';

import { filterViewProps } from '@fluentui-react-native/adapters';
import type { KeyPressEvent } from '@fluentui-react-native/interactive-hooks';
import { useAsPressable, useViewCommandFocus, useKeyDownProps } from '@fluentui-react-native/interactive-hooks';
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
      accessibilityPosInSet,
      ariaPosInSet,
      accessibilitySetSize,
      ariaSetSize,
      ...rest
    } = userProps;

    // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
    const info = React.useContext(RadioGroupContext);
    const {
      addRadioButtonEnabledKey,
      addRadioButtonKey,
      buttonKeys,
      enabledButtonKeys,
      invoked,
      onChange,
      removeRadioButtonEnabledKey,
      removeRadioButtonKey,
      selectedKey,
      updateInvoked,
      updateSelectedButtonRef,
    } = info;

    const buttonRef = useViewCommandFocus(componentRef);

    /* We don't want to call the user's onChange multiple times on the same selection. */
    const changeSelection = React.useCallback(() => {
      if (buttonKey != selectedKey) {
        onChange && onChange(buttonKey);
        updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
      }
    }, [buttonKey, componentRef, onChange, selectedKey, updateSelectedButtonRef]);

    /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
    React.useEffect(() => {
      if (buttonKey == selectedKey) {
        updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only on mount/unmount
    }, []);

    // Explicitly only run on mount and unmount
    React.useEffect(() => {
      addRadioButtonKey(buttonKey);

      if (!disabled) {
        addRadioButtonEnabledKey(buttonKey);
      }

      return () => {
        removeRadioButtonKey(buttonKey);
        removeRadioButtonEnabledKey(buttonKey);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only on mount/unmount
    }, []);

    const isRTL = I18nManager.isRTL;

    const onInvoke = React.useCallback(
      (e: KeyPressEvent) => {
        if (e.nativeEvent.key in DirectionalArrowKeys) {
          const length = enabledButtonKeys.length;
          const next =
            e.nativeEvent.key === DirectionalArrowKeys.ArrowDown ||
            (isRTL ? e.nativeEvent.key === DirectionalArrowKeys.ArrowLeft : e.nativeEvent.key === DirectionalArrowKeys.ArrowRight);
          const currRadioButtonIndex = enabledButtonKeys.indexOf(selectedKey);
          let newCurrRadioButtonIndex;
          if (next) {
            newCurrRadioButtonIndex = (currRadioButtonIndex + 1) % length;
          } else {
            // previous
            newCurrRadioButtonIndex = (currRadioButtonIndex - 1 + length) % length;
          }
          onChange && onChange(enabledButtonKeys[newCurrRadioButtonIndex]);
          updateInvoked && updateInvoked(true);
        }
      },
      [enabledButtonKeys, isRTL, onChange, selectedKey, updateInvoked],
    );

    // Sets the updated selected button ref and focus if this Radio is selected via arrow key.
    React.useEffect(() => {
      if (invoked && buttonKey === selectedKey && !disabled) {
        updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
        componentRef?.current?.focus();
        updateInvoked && updateInvoked(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when invoked changes
    }, [invoked]);

    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];

    // Explicitly override onKeyDown to override the native behavior of moving focus with arrow keys.
    const onKeyDownProps = useKeyDownProps(onInvoke, ...keys);

    // Ensure focus is placed on button after click
    const changeSelectionWithFocus = React.useCallback(() => {
      if (buttonKey != selectedKey) {
        onChange && onChange(buttonKey);
        updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
        updateInvoked && updateInvoked(true);
      }
    }, [buttonKey, componentRef, onChange, selectedKey, updateInvoked, updateSelectedButtonRef]);

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
      [changeSelection],
    );

    const state = {
      ...pressable.state,
      selected: selectedKey === userProps.buttonKey && !disabled,
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
        accessibilityPosInSet: accessibilityPosInSet ?? ariaPosInSet ?? buttonKeys.findIndex((x) => x == buttonKey) + 1,
        accessibilitySetSize: accessibilitySetSize ?? ariaSetSize ?? buttonKeys.length,
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
