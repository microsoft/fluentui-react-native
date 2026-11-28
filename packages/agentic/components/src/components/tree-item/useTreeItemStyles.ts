import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { treeItemStyles, treeItemTokens } from './tree-item.styles';
import { treeSurfaceStyle } from './treeSurfaceStyle';
import type { TreeItemState } from './tree-item.types';

export function useTreeItemStyles_unstable(state: TreeItemState) {
  const tokens = getComponentTokens(state, treeItemTokens);
  const primary = resolveTokenStates(tokens.primary, state).style;
  const label = resolveTokenStates(tokens.label, state).style;
  const leading = resolveTokenStates(tokens.leading, state).props;
  const chevron = resolveTokenStates(tokens.chevron, state).props;
  const gap = state.tokens.spacing.componentBase100;
  const step = typeof state.tokens.spacing.componentBase400 === 'number' ? state.tokens.spacing.componentBase400 : 16;
  attachSlotProps(state.root, { style: state.userStyle });
  attachSlotProps(state.row, { style: [treeItemStyles.row, { paddingStart: (Math.max(1, state.level) - 1) * step }] });
  attachSlotProps(state.primary, { style: [treeItemStyles.primary, treeSurfaceStyle(primary), { gap }] });
  attachSlotProps(state.disclosure, { style: [treeItemStyles.disclosure, { width: chevron.width }] });
  attachSlotProps(state.copy, { style: treeItemStyles.copy });
  attachSlotProps(state.label, { style: label });
  if (state.description) attachSlotProps(state.description, { style: resolveTokenStates(tokens.description, state).style });
  if (state.icon) attachSlotDefaults(state.icon, { ...leading, color: label.color });
  if (state.avatar) attachSlotDefaults(state.avatar, { size: state.size === 'small' ? 16 : 20 });
  if (state.chevron) attachSlotProps(state.chevron, { ...chevron, color: label.color });
  if (state.mark) attachSlotProps(state.mark, { ...leading, color: label.color });
  if (state.action) attachSlotProps(state.action, { style: treeItemStyles.action });
  applyFocusRingStyles(state.FocusRing, state, primary.borderRadius);
}
