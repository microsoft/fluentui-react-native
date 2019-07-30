import * as React from 'react';
import { IPressableRenderData, IPressableState, IWithOnStateChange } from './Pressable.props';
import { IDivProps } from '../htmlTypes';

export function useAsPressable(
  props: IWithOnStateChange<IDivProps>
): { props: IWithOnStateChange<IDivProps>; state: IPressableState; setState: (partial: IPressableState) => void } {
  const [state, setState] = React.useState({ pressed: false, hovered: false, focused: false } as IPressableState);
  const onSetState = React.useCallback(
    (partialState: IPressableState) => {
      const newState = { ...state, ...partialState };
      setState(newState);
      if (props.onStateChange) {
        props.onStateChange(newState);
      }
    },
    [state, setState, props.onStateChange]
  );
  const onMouseEnter = React.useCallback(_e => onSetState({ hovered: true }), [onSetState]);
  const onMouseLeave = React.useCallback(_e => onSetState({ hovered: false }), [onSetState]);
  const onMouseDown = React.useCallback(_e => onSetState({ pressed: true }), [onSetState]);
  const onMouseUp = React.useCallback(_e => onSetState({ pressed: false }), [onSetState]);
  const onFocus = React.useCallback(_e => onSetState({ focused: true }), [onSetState]);
  const onBlur = React.useCallback(_e => onSetState({ focused: false }), [onSetState]);
  const newProps = {
    ...props,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onFocus,
    onBlur
  };

  return { props: newProps, state, setState: onSetState };
}

export function useWebPressable(data: IPressableRenderData): IPressableRenderData {
  const { props, state, setState } = useAsPressable(data.props);
  data.state = { state, setState };
  data.props = props;
  return data;
}
