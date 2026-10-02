import * as React from 'react';
import { Platform } from 'react-native';
import { isSelfTargetEvent } from '@fluentui-react-native/framework-base';
import { useButton_unstable } from '../button/useButton';
import { ToolbarContext } from './ToolbarContext';
import { getToolbarButtonError } from './toolbar.children';
import { getToolbarKeyProps } from './toolbar.keyboard';
import type { ToolbarButtonProps, ToolbarButtonState } from './toolbar-button.types';

export function useToolbarButton_unstable(props: ToolbarButtonProps): ToolbarButtonState {
  const toolbar = React.useContext(ToolbarContext);
  const { value, onKeyDown, onFocus, onBlur, onPress, ...rest } = props;
  const error = getToolbarButtonError(props) ?? (!toolbar ? 'a Toolbar parent is required' : undefined);
  const valid = !error;
  const eligible = valid && toolbar.isEligible(value);
  const active = eligible && toolbar.activeValue === value;
  React.useEffect(() => {
    if (error) console.error(`ToolbarButton "${value ?? '(missing)'}" rejected: ${error}.`);
  }, [error, value]);

  const state = useButton_unstable({
    ...rest,
    ...getToolbarKeyProps(String(Platform.OS), active),
    appearance: 'subtle',
    size: toolbar?.size ?? 'large',
    focusable: active,
    accessible: true,
    onFocus: (event) => {
      if (isSelfTargetEvent(event)) toolbar?.onFocus(value);
      onFocus?.(event);
    },
    onBlur: (event) => {
      if (isSelfTargetEvent(event)) toolbar?.onBlur(value);
      onBlur?.(event);
    },
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (eligible && isSelfTargetEvent(event)) toolbar?.onKeyDown(value, event);
    },
    onPress: (event) => {
      if (eligible) toolbar?.onPress(value);
      onPress?.(event);
    },
  });
  const register = toolbar?.register;
  React.useLayoutEffect(() => (valid ? register?.(value, state.focusTarget) : undefined), [register, state.focusTarget, valid, value]);
  return { ...state, valid, value };
}
