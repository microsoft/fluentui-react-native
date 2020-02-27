import * as React from 'react';
import { IFocusState } from './Pressable.types';
import { IViewPropsWin32 } from '@fluentui-native/adapters';

export function useFocusState<_T>(): [IViewPropsWin32, IFocusState] {
  const [state, setFocusState] = React.useState({ focused: false });
  const onFocus = React.useCallback(() => setFocusState({ focused: true }), [setFocusState]);
  const onBlur = React.useCallback(() => setFocusState({ focused: false }), [setFocusState]);
  return [{ onFocus, onBlur }, state];
}
