import * as React from 'react';
import type { AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import { usePressableState, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { RadioProps, RadioInfo } from './Radio.types';
import { useRadioGroupContext } from '../RadioGroup/radioGroupContext';

const defaultAccessibilityActions = [{ name: 'Select' }];

export const useRadio = (props: RadioProps): RadioInfo => {
  const defaultComponentRef = React.useRef(null);

  // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
  const radioGroupContext = useRadioGroupContext();

  const {
    label,
    subtext,
    value,
    disabled,
    labelPosition = radioGroupContext.layout === 'horizontal-stacked' ? 'below' : 'after',
    accessibilityActions,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    componentRef = defaultComponentRef,
    accessibilityPosInSet,
    accessibilitySetSize,
    enableFocusRing,
    ...rest
  } = props;

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

  // Ensure focus is placed on button after click
  const changeSelectionWithFocus = useOnPressWithFocus(componentRef, changeSelection);

  /* RadioButton changes selection when focus is moved between each RadioButton and on a click */
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
    labelPositionBelow: labelPosition === 'below',
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
      enableFocusRing: enableFocusRing ?? true,
      onAccessibilityAction: onAccessibilityAction,
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
