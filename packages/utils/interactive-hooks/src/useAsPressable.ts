import { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableHooks, IWithPressableOptions } from './Pressable.types';
import { useHoverState } from './useHoverState';
import { useFocusState } from './useFocusState';
import { usePressState } from './usePressState';

export function useAsPressable(props: IWithPressableOptions<IViewProps>): IPressableHooks<IViewProps> {
  const [hoverProps, hoverState] = useHoverState();
  const [pressProps, pressState] = usePressState(props);
  const [focusProps, focusState] = useFocusState();

  return {
    props: { ...props, ...hoverProps, ...pressProps, ...focusProps },
    state: { ...hoverState, ...pressState, ...focusState }
  };
}
