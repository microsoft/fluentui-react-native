import * as React from 'react';
import { Platform } from 'react-native';
import type { PressableProps } from 'react-native';
import { attachSlotProps, isSelfTargetEvent, resolveAccessibilityAction } from '@fluentui-react-native/framework-base';
import type { FocusablePressableProps, FocusKeyboardEvent } from '@fluentui-react-native/framework-base';

import { useRadio_unstable } from '../radio/useRadio';
import type { RadioProps } from '../radio/radio.types';
import { RadioGroupContext } from './RadioGroupContext';
import { ownedItemNativeProps, rejectRadioGroupOverrides, requireRadioGroupText } from './radio-group.children';
import type { RadioGroupItemProps, RadioGroupItemState } from './radio-group-item.types';

const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
const handledNavigationKeys = navigationKeys.map((key) => ({
  key,
  code: key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  eventPhase: 3 as const,
  handledEventPhase: 3 as const,
}));

export function useRadioGroupItem_unstable(props: RadioGroupItemProps): RadioGroupItemState {
  const group = React.useContext(RadioGroupContext);
  if (!group) throw new Error('RadioGroupItem: a direct RadioGroup parent is required.');
  const {
    value,
    label,
    disabled: itemDisabled = false,
    onPress,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onAccessibilityAction,
    accessibilityActions,
    accessibilityState,
    ...rest
  } = props;
  requireRadioGroupText(value, 'item value');
  requireRadioGroupText(label, `label for "${value}"`);
  if (rest.accessibilityLabel !== undefined) requireRadioGroupText(rest.accessibilityLabel, `accessibilityLabel for "${value}"`);
  if (rest['aria-label'] !== undefined) requireRadioGroupText(rest['aria-label'], `aria-label for "${value}"`);
  rejectRadioGroupOverrides(props, ownedItemNativeProps, 'RadioGroupItem');
  if (
    accessibilityState &&
    ('checked' in accessibilityState ||
      'selected' in accessibilityState ||
      'disabled' in accessibilityState ||
      'required' in accessibilityState ||
      'multiselectable' in accessibilityState)
  ) {
    throw new Error(`RadioGroupItem: checked, selected, disabled, required and multiselectable state are owned for "${value}".`);
  }
  if (group.getPosition(value) < 1) throw new Error(`RadioGroupItem: "${value}" is not a direct member.`);
  const disabled = group.disabled || itemDisabled;
  const selected = group.selectedValue === value;
  const select = resolveAccessibilityAction('select', Platform.OS, accessibilityActions);
  const activate: NonNullable<PressableProps['onPress']> = (event) => {
    if (!group.isEligible(value) || !state.focusTarget.current) return;
    const native = event?.nativeEvent;
    const keyboard = native != null && ('key' in native || 'code' in native);
    const platform: string = Platform.OS;
    group.onItemSelect(value, !keyboard && (platform === 'windows' || platform === 'win32') ? 'pointer' : undefined);
    onPress?.(event);
  };
  const radioProps: RadioProps & Pick<FocusablePressableProps, 'onKeyDown' | 'onKeyUp'> = {
    ...rest,
    label,
    selected,
    disabled,
    accessible: true,
    focusable: !disabled && group.activeValue === value,
    accessibilityState: { ...accessibilityState, selected },
    accessibilityActions: select.accessibilityActions,
    onPress: activate,
    onFocus: (event) => {
      if (isSelfTargetEvent(event)) group.onItemFocus(value);
      onFocus?.(event);
    },
    onBlur: (event) => {
      if (isSelfTargetEvent(event)) group.onItemBlur(value);
      onBlur?.(event);
    },
    onKeyDown: (event: FocusKeyboardEvent) => {
      group.onItemKeyDown(value, event);
      onKeyDown?.(event);
    },
    onKeyUp,
    onAccessibilityAction: (event) => {
      if (event.nativeEvent.actionName === select.name && group.isEligible(value) && state.focusTarget.current) group.onItemSelect(value);
      onAccessibilityAction?.(event);
    },
  };
  const state = useRadio_unstable(radioProps);
  const { registerItem } = group;
  React.useLayoutEffect(() => registerItem(value, state.focusTarget), [registerItem, value, state.focusTarget]);
  const nativeKeyProps = {
    keyDownEvents: disabled ? [] : handledNavigationKeys,
    accessibilityPosInSet: group.getPosition(value),
    accessibilitySetSize: group.setSize,
  };
  // Replace only the pre-focus press wrapper; Radio retains keyboard/release/target handlers.
  attachSlotProps(state.root, {
    ...nativeKeyProps,
    onPress: activate,
  });
  return { ...state, value };
}
