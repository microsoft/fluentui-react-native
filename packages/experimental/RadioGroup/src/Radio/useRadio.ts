import { RadioProps, RadioState } from './Radio.types';
import * as React from 'react';
import { useRadioGroupContext } from '../RadioGroup/radioGroupContext';
import { useAsPressable, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { radioSelectActionLabel } from './Radio.styling';

export const useRadio = (props: RadioProps): RadioState => {
  const defaultComponentRef = React.useRef(null);
  const {
    value,
    disabled,
    accessibilityLabel,
    componentRef = defaultComponentRef,
    accessibilityPositionInSet,
    accessibilitySetSize,
    ...rest
  } = props;

  // Grabs the context information from RadioGroup (currently selected button and client's onChange callback)
  const info = useRadioGroupContext();

  const buttonRef = useViewCommandFocus(componentRef);

  /* We don't want to call the user's onChange multiple times on the same selection. */
  const changeSelection = React.useCallback(() => {
    if (value != info.value) {
      info.onChange && info.onChange(value);
      info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
    }
  }, [info, value, componentRef]);

  /* We use the componentRef of the currently selected button to maintain the default tabbable
    element in a RadioGroup. Since the componentRef isn't generated until after initial render,
    we must update it once here. */
  React.useEffect(() => {
    if (value == info.value) {
      info.updateSelectedButtonRef && componentRef && info.updateSelectedButtonRef(componentRef);
    }
  }, [info, value, componentRef]);

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
    [changeSelection],
  );

  const state = {
    ...pressable.state,
    selected: info.value === props.value,
    disabled: disabled || false,
  };

  return {
    props: {
      value: value,
      ...rest,
      ref: buttonRef,
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'radio',
      accessibilityLabel,
      accessibilityState: { disabled: state.disabled, selected: state.selected },
      accessibilityActions: [{ name: 'Select', label: radioSelectActionLabel }],
      accessibilityPositionInSet: accessibilityPositionInSet ?? info.buttonKeys.findIndex((x) => x == value) + 1,
      accessibilitySetSize: accessibilitySetSize ?? info.buttonKeys.length,
      focusable: !state.disabled,
      onAccessibilityAction: onAccessibilityAction,
    },
    state: state,
  };
};
