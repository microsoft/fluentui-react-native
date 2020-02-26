import { IViewProps } from '@fluentui-native/adapters';
import { IWithPressableOptions, IPressState } from './Pressable.types';

/**
 * NYI - needs responder based pressable implementation for iOS/Android
 * @param props - props to implement handler for
 */
export function usePressState(_props: IWithPressableOptions<IViewProps>): [IViewProps, IPressState] {
  return [{}, {}];
}
