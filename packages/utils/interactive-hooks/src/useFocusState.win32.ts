import * as React from 'react';
import { IFocusState } from './Pressable.types';
import { IViewProps } from '@fluentui-native/adapters/lib/adapters.win32';

export function useFocusState(): [IViewProps, IFocusState] {
  const [state, setFocusState] = React.useState({ focused: false });
  const onFocus = React.useCallback(() => setFocusState({ focused: true }), [setFocusState]);
  const onBlur = React.useCallback(() => setFocusState({ focused: false }), [setFocusState]);
  return [{ onFocus, onBlur }, state];
}
