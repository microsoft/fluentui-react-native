import { IViewProps } from '@fluentui-react-native/adapters';
import { IWithPressableOptions, IPressState } from './Pressable.types';

/**
 * NYI - needs responder based pressable implementation for iOS/Android
 * @param props - props to implement handler for
 */
export function usePressState<TViewProps extends object = IViewProps>(
  _props: IWithPressableOptions<TViewProps>
): [TViewProps, IPressState] {
  return [{} as TViewProps, {}];
}
