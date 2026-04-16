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
  const { disabled: groupDisabled, layout, onChange, updateSelectedButtonRef, value: selectedValue, values } = radioGroupContext;

  const {
    label,
    subtext,
    value,
    disabled,
    labelPosition = layout === 'horizontal-stacked' ? 'below' : 'after',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only on mount/unmount
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
    selected: selectedValue === props.value && !isDisabled,
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
      accessibilityPosInSet: accessibilityPosInSet ?? values.findIndex((x) => x == value) + 1,
      accessibilitySetSize: accessibilitySetSize ?? values.length,
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
