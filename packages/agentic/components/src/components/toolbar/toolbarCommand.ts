import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import type { FocusablePressableProps } from '@fluentui-react-native/framework-base';
import { composeHandlers, isKeyboardPress } from '../../common/eventHandlers';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { ButtonProps } from '../button/button.types';
import { renderButton_unstable } from '../button/renderButton';
import { useButton_unstable } from '../button/useButton';
import { useButtonStyles_unstable } from '../button/useButtonStyles';
import type { ToggleButtonProps } from '../toggle-button/toggle-button.types';
import { renderToggleButton_unstable } from '../toggle-button/renderToggleButton';
import { useToggleButton_unstable } from '../toggle-button/useToggleButton';
import { useToggleButtonStyles_unstable } from '../toggle-button/useToggleButtonStyles';
import type { ToolbarSize } from './toolbar.types';

type OwnedCommand<T> = { props: T; value: string; size: ToolbarSize; focus: KeyedFocus };
type NativeKeys = Pick<FocusablePressableProps, 'onKeyDown' | 'onKeyUp'> & {
  keyDownEvents?: ReturnType<KeyedFocus['getProps']>['keyDownEvents'];
};

function commandProps<T extends ButtonProps | ToggleButtonProps>({ props, value, size, focus }: OwnedCommand<T>) {
  const { onKeyDown, keyDownEvents } = props as T & NativeKeys;
  const managed = focus.getProps(value);
  return {
    ...props,
    size,
    focusable: managed.focusable && props.focusable !== false,
    keyDownEvents: managed.keyDownEvents ? [...(keyDownEvents ?? []), ...managed.keyDownEvents] : keyDownEvents,
    onFocus: composeHandlers(props.onFocus, managed.onFocus),
    onBlur: composeHandlers(props.onBlur, managed.onBlur),
    onKeyDown: composeHandlers(onKeyDown, managed.onKeyDown),
    onPressIn: composeHandlers<[GestureResponderEvent]>((event) => {
      if (!managed.focusable && !isKeyboardPress(event) && (Platform.OS === 'windows' || String(Platform.OS) === 'win32')) {
        focus.requestFocus(value, 'pointer');
      }
    }, props.onPressIn),
  };
}

export function ToolbarButton(options: OwnedCommand<ButtonProps>) {
  const state = useButton_unstable(commandProps(options));
  const { register } = options.focus;
  useLayoutEffect(() => register(options.value, state.focusTarget), [options.value, register, state.focusTarget]);
  useButtonStyles_unstable(state);
  return renderButton_unstable(state);
}

export function ToolbarToggleButton(options: OwnedCommand<ToggleButtonProps>) {
  const state = useToggleButton_unstable(commandProps(options));
  const { register } = options.focus;
  useLayoutEffect(() => register(options.value, state.focusTarget), [options.value, register, state.focusTarget]);
  useToggleButtonStyles_unstable(state);
  return renderToggleButton_unstable(state);
}
