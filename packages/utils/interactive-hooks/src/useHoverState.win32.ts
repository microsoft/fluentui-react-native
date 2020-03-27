import * as React from 'react';
import { IHoverState } from './Pressable.types';
import { IViewPropsWin32 } from '@fluentui-react-native/adapters';

/**
 * useHoverState will add implementations for onMouseEnter and onMouseLeave to the props passed to the
 * View.  These will be used to update the returned hover state and trigger re-renders (via state change)
 */
export function useHoverState<_T>(): [IViewPropsWin32, IHoverState] {
  const [state, setHoverState] = React.useState({ hovered: false });
  const onMouseEnter = React.useCallback(() => setHoverState({ hovered: true }), [setHoverState]);
  const onMouseLeave = React.useCallback(() => setHoverState({ hovered: false }), [setHoverState]);
  return [{ onMouseEnter, onMouseLeave }, state];
}
