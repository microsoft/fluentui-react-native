import { RadioProps, RadioInfo } from './Radio.types';
import * as React from 'react';
import { useRadioGroupContext } from '../RadioGroup/radioGroupContext';
import { usePressableState, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';
// import { IViewWin32Props } from '@office-iss/react-native-win32';
import type { IHandledKeyboardEvent } from '@office-iss/react-native-win32';

const defaultAccessibilityActions = [{ name: 'Select' }];

export const useRadio = (props: RadioProps): RadioInfo => {
  const defaultComponentRef = React.useRef(null);

  // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
  const radioGroupContext = useRadioGroupContext();

  // Disables arrow up, arrow down, arrow right, and arrow left behavior on native side
  const handledNativeKeyboardEvents: IHandledKeyboardEvent[] = [
    { key: 'ArrowDown' },
    { key: 'ArrowUp' },
    { key: 'ArrowRight' },
    { key: 'ArrowLeft' },
  ];

  // const keyPressProps: Omit<IViewWin32Props, 'accessibilityRole' | 'onBlur' | 'onFocus'> = {
  //   keyDownEvents: [{ key: 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft' }],
  //   onKeyDown: (args) => {
  //     if (args.nativeEvent.key === 'a') {
  //       setKeyDetected('a (down)');
  //       args.stopPropagation();
  //     }
  //   },
  //   keyUpEvents: [{ key: 'b' }],
  //   onKeyUp: (args) => {
  //     if (args.nativeEvent.key === 'b') {
  //       setKeyDetected('b (up)');
  //       args.stopPropagation();
  //     }
  //   },
  // };

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
    keyDownEvents = handledNativeKeyboardEvents,
    // ...keyPressProps,
    // isCircularNavigation,
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

  // const onKeyDown = (e: KeyboardEvent) => {
  //   if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
  //     // const length = state.info.enabledKeys.length;
  //     // const currRadioIndex = state.info.enabledKeys.findIndex((x) => x == state.context.selectedKey);
  //     const length = radioGroupContext.values.length;
  //     const currRadioIndex = radioGroupContext.values.findIndex((x) => x == radioGroupContext.value);
  //     let newCurrRadioIndex;
  //     if (e.key === 'ArrowRight') {
  //       if (isCircularNavigation || !(currRadioIndex + 1 == length)) {
  //         newCurrRadioIndex = (currRadioIndex + 1) % length;
  //         // radioGroupContext.onChange && radioGroupContext.onChange(value);
  //         // radioGroupContext.updateSelectedButtonRef && componentRef && radioGroupContext.updateSelectedButtonRef(componentRef);
  //         state.context.selectedKey = radioGroupContext.values[newCurrRadioIndex];
  //         data.onKeySelect(state.context.selectedKey);
  //       }
  //     } else {
  //       if (isCircularNavigation || !(currTabItemIndex == 0)) {
  //         newCurrTabItemIndex = (currTabItemIndex - 1 + length) % length;
  //         state.context.selectedKey = state.info.enabledKeys[newCurrTabItemIndex];
  //         data.onKeySelect(state.context.selectedKey);
  //       }
  //     }
  //   }
  // };

  /* Radio changes selection when focus is moved between each RadioButton and on a click */
  const pressable = usePressableState({
    ...rest,
    onPress: changeSelectionWithFocus, // changeSelectionWithFocus
    // onKeyDown,
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
      keyDownEvents,
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
