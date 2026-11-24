import { ScrollView } from 'react-native';
import { useSlot } from '@fluentui-react-native/framework-base';
import type { ScrollbarProps, ScrollbarState } from './scrollbar.types';

export function useScrollbar_unstable({
  scrollOwner,
  orientation = 'vertical',
  enabled = true,
  ref,
  style,
}: ScrollbarProps): ScrollbarState {
  const { children, style: ownerStyle, ...viewport } = scrollOwner;
  const horizontal = orientation === 'horizontal';
  return {
    children,
    style,
    ownerStyle,
    root: useSlot(ScrollView, {
      ...viewport,
      ref,
      horizontal,
      showsHorizontalScrollIndicator: enabled && horizontal,
      showsVerticalScrollIndicator: enabled && !horizontal,
    }),
  };
}
