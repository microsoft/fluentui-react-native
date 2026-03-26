import * as React from 'react';
import type { AccessibilityState } from 'react-native';
import { I18nManager } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { KeyPressEvent } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useOnPressWithFocus, useViewCommandFocus, useKeyDownProps } from '@fluentui-react-native/interactive-hooks';

import type { RadioProps, RadioInfo } from './Radio.types';
import { useRadioGroupContext } from '../RadioGroup/radioGroupContext';

const defaultAccessibilityActions = [{ name: 'Select' }];

enum DirectionalArrowKeys {
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
}

export const useRadio = (props: RadioProps): RadioInfo => {
  const defaultComponentRef = React.useRef(null);

  // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
  const radioGroupContext = useRadioGroupContext();
  const {
    addRadioEnabledValue,
    addRadioValue,
    disabled: groupDisabled,
    enabledValues,
    invoked,
    layout,
    onChange,
    removeRadioEnabledValue,
    removeRadioValue,
    updateInvoked,
    updateSelectedButtonRef,
    value: selectedValue,
    values,
  } = radioGroupContext;

  const {
    label,
    subtext,
    value,
    disabled,
    accessibilityActions,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    componentRef = defaultComponentRef,
    accessibilityPosInSet,
    accessibilitySetSize,
    ...rest
  } = props;

  const labelPosition = layout === 'horizontal-stacked' ? 'below' : 'after';

  const isDisabled = groupDisabled || disabled;

  const buttonRef = useViewCommandFocus(componentRef);

  /* We don't want to call the user's onChange multiple times on the same selection. */
  const changeSelection = React.useCallback(() => {
    if (value !== selectedValue) {
      onChange && onChange(value);
      updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
    }
  }, [componentRef, onChange, selectedValue, updateSelectedButtonRef, value]);

  /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
  React.useEffect(() => {
    if (value === selectedValue && !isDisabled) {
      updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
    }
  }, [componentRef, isDisabled, selectedValue, updateSelectedButtonRef, value]);

  // Explicitly only run on mount and unmount
  React.useEffect(() => {
    addRadioValue(value);

    return () => {
      removeRadioValue(value);
    };
  }, [addRadioValue, removeRadioValue, value]);

  React.useEffect(() => {
    if (isDisabled) {
      removeRadioEnabledValue(value);
    } else {
      addRadioEnabledValue(value);
    }
  }, [addRadioEnabledValue, isDisabled, removeRadioEnabledValue, value]);

  const isRTL = I18nManager.isRTL;

  const onInvoke = React.useCallback(
    (e: KeyPressEvent) => {
      if (e.nativeEvent.key in DirectionalArrowKeys) {
        const length = enabledValues.length;
        const previous =
          e.nativeEvent.key === DirectionalArrowKeys.ArrowUp ||
          (isRTL ? e.nativeEvent.key === DirectionalArrowKeys.ArrowRight : e.nativeEvent.key === DirectionalArrowKeys.ArrowLeft);
        const next =
          e.nativeEvent.key === DirectionalArrowKeys.ArrowDown ||
          (isRTL ? e.nativeEvent.key === DirectionalArrowKeys.ArrowLeft : e.nativeEvent.key === DirectionalArrowKeys.ArrowRight);
        const currRadioIndex = enabledValues.indexOf(selectedValue);
        let newCurrRadioIndex;
        if (next) {
          newCurrRadioIndex = (currRadioIndex + 1) % length;
          onChange && onChange(enabledValues[newCurrRadioIndex]);
          updateInvoked && updateInvoked(true);
        } else if (previous) {
          newCurrRadioIndex = (currRadioIndex - 1 + length) % length;
          onChange && onChange(enabledValues[newCurrRadioIndex]);
          updateInvoked && updateInvoked(true);
        }
      }
    },
    [enabledValues, isRTL, onChange, selectedValue, updateInvoked],
  );

  // Sets the updated selected button ref and focus if this Radio is selected via arrow key.
  React.useEffect(() => {
    if (invoked && value === selectedValue && !isDisabled) {
      updateSelectedButtonRef && componentRef && updateSelectedButtonRef(componentRef);
      componentRef?.current?.focus();
      updateInvoked && updateInvoked(false);
    }
  }, [componentRef, invoked, isDisabled, selectedValue, updateInvoked, updateSelectedButtonRef, value]);

  const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];

  // Explicitly override onKeyDown to override the native behavior of moving focus with arrow keys.
  const onKeyDownProps = useKeyDownProps(onInvoke, ...keys);

  // Ensure focus is placed on button after click
  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  /* Radio changes selection when focus is moved between each RadioButton and on a click */
  const pressable = usePressableState({
    ...rest,
    onPress: changeSelectionWithFocus,
    onFocus: changeSelection,
  });

  const accessibilityActionsProp = React.useMemo(
    () => (accessibilityActions ? [...defaultAccessibilityActions, ...accessibilityActions] : defaultAccessibilityActions),
    [accessibilityActions],
  );

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
    selected: selectedValue === props.value && !isDisabled,
    disabled: isDisabled || false,
  };

  return {
    props: {
      value,
      label,
      subtext,
      labelPosition,
      ...rest,
      ref: buttonRef,
      ...pressable.props,
      accessibilityRole: 'radio',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityHint: accessibilityHint ?? subtext,
      accessibilityState: getAccessibilityState(state.disabled, state.selected, accessibilityState),
      accessibilityActions: accessibilityActionsProp,
      accessibilityPosInSet: accessibilityPosInSet ?? values.findIndex((x) => x == value) + 1,
      accessibilitySetSize: accessibilitySetSize ?? values.length,
      focusable: !state.disabled,
      disabled: isDisabled,
      onAccessibilityAction: onAccessibilityAction,
      ...onKeyDownProps,
    },
    state: state,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, selected: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled, selected, ...accessibilityState };
  }
  return { disabled, selected };
}
