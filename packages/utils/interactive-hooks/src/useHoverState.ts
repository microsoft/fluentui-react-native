import { IHoverState } from './Pressable.types';
import { IViewProps } from '@fluentui-native/adapters';

/**
 * on platforms that don't support hover this is a complete no-op, don't decorate any props
 * and never return that the component is hovered
 */
export function useHoverState(): [IViewProps, IHoverState] {
  return [{}, {}];
}
