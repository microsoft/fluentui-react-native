import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { getToolbarSizeStyle, toolbarStyles } from './toolbar.styles';
import type { ToolbarState } from './toolbar.types';

export function useToolbarStyles_unstable(state: ToolbarState) {
  attachSlotProps(state.root, {
    style: [toolbarStyles.root, state.valid && getToolbarSizeStyle(state), { direction: state.direction }, state.valid && state.userStyle],
  });
}
