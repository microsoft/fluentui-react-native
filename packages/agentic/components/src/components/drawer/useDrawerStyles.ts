import type { ViewStyle } from 'react-native';
import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { drawerStyles, drawerTokens } from './drawer.styles';
import type { DrawerState } from './drawer.types';

export function useDrawerStyles_unstable(state: DrawerState) {
  const tokens = getComponentTokens(state, drawerTokens);
  const surface = resolveTokenStates(tokens.surface, state).style;
  const bottom = state.position === 'bottom';
  const maximum =
    state.availableExtent !== undefined && Number.isFinite(state.availableExtent) && state.availableExtent >= 0
      ? state.availableExtent
      : '100%';
  const extent = state.size === 'custom' ? state.customSize : bottom ? surface.height : surface.width;
  const edgeSize: ViewStyle = bottom ? { maxHeight: maximum, height: extent } : { maxWidth: maximum, width: extent };
  attachSlotProps(state.root, { style: [drawerStyles.root, surface, edgeSize, state.userStyle, !state.open && drawerStyles.hidden] });
  attachSlotProps(state.header, { style: resolveTokenStates(tokens.header, state).style });
  attachSlotProps(state.heading, { style: drawerStyles.heading });
  const { paddingHorizontal, ...body } = resolveTokenStates(tokens.body, state).style;
  attachSlotProps(state.body, { style: body, contentContainerStyle: { paddingHorizontal } });
  if (state.footer) attachSlotProps(state.footer, { style: resolveTokenStates(tokens.footer, state).style });
}
