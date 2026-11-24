/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ScrollbarState } from './scrollbar.types';

export function renderScrollbar_unstable(state: ScrollbarState) {
  return <state.root>{state.children}</state.root>;
}
