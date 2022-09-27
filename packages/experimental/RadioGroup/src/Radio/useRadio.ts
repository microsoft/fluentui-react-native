import { RadioProps, RadioState } from './Radio.types';
import * as React from 'react';
import { useRadioGroupContext } from '../RadioGroup/radioGroupContext';
import { useAsPressable, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';

const defaultAccessibilityActions = [{ name: 'Select' }];

export const useRadio = (props: RadioProps): RadioState => {
  const defaultComponentRef = React.useRef(null);
  const {
    label,
    value,
    disabled,
    accessibilityActions,
    accessibilityLabel,
    accessibilityState,
    componentRef = defaultComponentRef,
    accessibilityPositionInSet,
    accessibilitySetSize,
    enableFocusRing,
    ...rest
  } = props;

  // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
  const selectedInfo = useRadioGroupContext();

  const buttonRef = useViewCommandFocus(componentRef);

  /* We don't want to call the user's onChange multiple times on the same selection. */
  const changeSelection = React.useCallback(() => {
    if (value != selectedInfo.value) {
      selectedInfo.onChange && selectedInfo.onChange(value);
      selectedInfo.updateSelectedButtonRef && componentRef && selectedInfo.updateSelectedButtonRef(componentRef);
    }
  }, [selectedInfo, value, componentRef]);

  /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
  React.useEffect(() => {
    if (value == selectedInfo.value) {
      selectedInfo.updateSelectedButtonRef && componentRef && selectedInfo.updateSelectedButtonRef(componentRef);
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
    selected: selectedInfo.value === props.value,
    disabled: selectedInfo.disabled || disabled || false,
  };

  return {
    props: {
      value,
      label,
      ...rest,
      ref: buttonRef,
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'radio',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: getAccessibilityState(state.disabled, state.selected, accessibilityState),
      accessibilityActions: accessibilityActionsProp,
      accessibilityPositionInSet: accessibilityPositionInSet ?? selectedInfo.buttonKeys.findIndex((x) => x == value) + 1,
      accessibilitySetSize: accessibilitySetSize ?? selectedInfo.buttonKeys.length,
      focusable: !state.disabled,
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
