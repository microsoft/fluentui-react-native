import { RadioProps, RadioInfo } from './Radio.types';
import * as React from 'react';
import { useRadioGroupContext } from '../RadioGroup/radioGroupContext';
import {
  usePressableState,
  useOnPressWithFocus,
  useViewCommandFocus,
  KeyPressEvent,
  useKeyDownProps,
} from '@fluentui-react-native/interactive-hooks';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';

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
    accessibilityPositionInSet,
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

  const onInvoke = React.useCallback(
    (e: KeyPressEvent) => {
      const length = radioGroupContext.enabledValues.length;
      const currRadioIndex = radioGroupContext.enabledValues.indexOf(radioGroupContext.value);
      let newCurrRadioIndex;
      if (e.nativeEvent.key === 'ArrowDown' || e.nativeEvent.key === 'ArrowRight') {
        newCurrRadioIndex = (currRadioIndex + 1) % length;
      } else if (e.nativeEvent.key === 'ArrowUp' || e.nativeEvent.key === 'ArrowLeft') {
        newCurrRadioIndex = (currRadioIndex - 1 + length) % length;
      }
      radioGroupContext.onChange && radioGroupContext.onChange(radioGroupContext.enabledValues[newCurrRadioIndex]);
      radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
      componentRef?.current?.focus();
    },
    [radioGroupContext, componentRef],
  );

  // Sets the focus on this Radio if this Radio is selected.
  React.useEffect(() => {
    if (value === radioGroupContext.value && !isDisabled) {
      radioGroupContext.onChange && radioGroupContext.onChange(radioGroupContext.value);
      radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
      componentRef?.current?.focus();
    }
  }, [radioGroupContext]);

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
      accessibilityPositionInSet: accessibilityPositionInSet ?? radioGroupContext.values.findIndex((x) => x == value) + 1,
      accessibilitySetSize: accessibilitySetSize ?? radioGroupContext.values.length,
      focusable: !state.disabled,
      enableFocusRing: enableFocusRing ?? true,
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
