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

  const labelPosition = radioGroupContext.layout === 'horizontal-stacked' ? 'below' : 'after';

  const isDisabled = radioGroupContext.disabled || disabled;

  const buttonRef = useViewCommandFocus(componentRef);

  /* We don't want to call the user's onChange multiple times on the same selection. */
  const changeSelection = React.useCallback(() => {
    if (value !== radioGroupContext.value) {
      radioGroupContext.onChange && radioGroupContext.onChange(value);
      radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
    }
  }, [radioGroupContext, value, componentRef]);

  /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
  React.useEffect(() => {
    if (value === radioGroupContext.value && !isDisabled) {
      radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
    }
  }, []);

  // Explicitly only run on mount and unmount
  React.useEffect(() => {
    radioGroupContext.addRadioValue(value);

    return () => {
      radioGroupContext.removeRadioValue(value);
    };
  }, []);

  React.useEffect(() => {
    if (isDisabled) {
      radioGroupContext.removeRadioEnabledValue(value);
    } else {
      radioGroupContext.addRadioEnabledValue(value);
    }
  }, [isDisabled]);

  const isRTL = I18nManager.isRTL;

  const onInvoke = React.useCallback(
    (e: KeyPressEvent) => {
      if (e.nativeEvent.key in DirectionalArrowKeys) {
        const length = radioGroupContext.enabledValues.length;
        const previous =
          e.nativeEvent.key === DirectionalArrowKeys.ArrowUp ||
          (isRTL ? e.nativeEvent.key === DirectionalArrowKeys.ArrowRight : e.nativeEvent.key === DirectionalArrowKeys.ArrowLeft);
        const next =
          e.nativeEvent.key === DirectionalArrowKeys.ArrowDown ||
          (isRTL ? e.nativeEvent.key === DirectionalArrowKeys.ArrowLeft : e.nativeEvent.key === DirectionalArrowKeys.ArrowRight);
        const currRadioIndex = radioGroupContext.enabledValues.indexOf(radioGroupContext.value);
        let newCurrRadioIndex;
        if (next) {
          newCurrRadioIndex = (currRadioIndex + 1) % length;
          radioGroupContext.onChange && radioGroupContext.onChange(radioGroupContext.enabledValues[newCurrRadioIndex]);
          radioGroupContext.updateInvoked && radioGroupContext.updateInvoked(true);
        } else if (previous) {
          newCurrRadioIndex = (currRadioIndex - 1 + length) % length;
          radioGroupContext.onChange && radioGroupContext.onChange(radioGroupContext.enabledValues[newCurrRadioIndex]);
          radioGroupContext.updateInvoked && radioGroupContext.updateInvoked(true);
        }
      }
    },
    [radioGroupContext],
  );

  // Sets the updated selected button ref and focus if this Radio is selected via arrow key.
  React.useEffect(() => {
    if (radioGroupContext.invoked && value === radioGroupContext.value && !isDisabled) {
      radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
      componentRef?.current?.focus();
      radioGroupContext.updateInvoked && radioGroupContext.updateInvoked(false);
    }
  }, [radioGroupContext.invoked]);

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
    selected: radioGroupContext.value === props.value && !isDisabled,
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
      accessibilityPosInSet: accessibilityPosInSet ?? radioGroupContext.values.findIndex((x) => x == value) + 1,
      accessibilitySetSize: accessibilitySetSize ?? radioGroupContext.values.length,
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
