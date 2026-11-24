import { attachSlotProps } from '@fluentui-react-native/framework-base';
import type { ScrollbarState } from './scrollbar.types';

export function useScrollbarStyles_unstable(state: ScrollbarState) {
  attachSlotProps(state.root, { style: [state.ownerStyle, state.style] });
}
