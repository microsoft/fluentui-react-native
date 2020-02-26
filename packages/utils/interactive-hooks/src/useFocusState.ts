import { IFocusState } from './Pressable.types';
import { IViewProps } from '@fluentui-native/adapters';

/**
 * on platforms that don't support focus this is a complete no-op, don't decorate any props
 * and never return that the component is focused
 */
export function useFocusState(): [IViewProps, IFocusState] {
  return [{}, {}];
}
