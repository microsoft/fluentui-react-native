import * as React from 'react';
import { IPressableRenderData, IPressableState, IWithOnStateChange } from './Pressable.props';
import { IDivProps } from '../htmlTypes';

export function usePressableStateChange<StateType, PropsType extends Record<string, any>>(
  initialState: StateType,
  props: IWithOnStateChange<PropsType>
): [any, (partial: StateType) => void] {
  const [state, setState] = React.useState(initialState as StateType);
  const onSetState = React.useCallback(
    (partialState: StateType) => {
      const newState = { ...state, ...partialState };
      setState(newState);
      if (props.onStateChange) {
        props.onStateChange(newState);
      }
    },
    [state, setState, props.onStateChange]
  );

  return [state, onSetState];
}

export function useAsPressable(
  props: IWithOnStateChange<IDivProps>
): { props: IWithOnStateChange<IDivProps>; state: IPressableState; setState: (partial: IPressableState) => void } {
  const initialState = { pressed: false, hovered: false, focused: false };

  const [state, onSetState] = usePressableStateChange<IPressableState, IWithOnStateChange<IDivProps>>(initialState, props);
  const onMouseEnter = React.useCallback(() => onSetState({ hovered: true }), [onSetState]);
  const onMouseLeave = React.useCallback(() => onSetState({ hovered: false }), [onSetState]);
  const onMouseDown = React.useCallback(() => onSetState({ pressed: true }), [onSetState]);
  const onMouseUp = React.useCallback(() => onSetState({ pressed: false }), [onSetState]);
  const onFocus = React.useCallback(() => onSetState({ focused: true }), [onSetState]);
  const onBlur = React.useCallback(() => onSetState({ focused: false }), [onSetState]);
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
