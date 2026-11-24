import { useLayoutEffect } from 'react';
import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { breadcrumbStyles, breadcrumbTokens } from './breadcrumb.styles';
import type { BreadcrumbAncestor, BreadcrumbState } from './breadcrumb.types';
import { partitionTrail } from './breadcrumbLayout';

export function useBreadcrumbStyles_unstable(state: BreadcrumbState) {
  const tokens = getComponentTokens(state, breadcrumbTokens);
  const root = resolveTokenStates(tokens.root, state).style;
  const currentStyle = resolveTokenStates(tokens.current, state).style;
  const { color: _color, flexShrink: _flexShrink, ...typography } = currentStyle;
  const separator = resolveTokenStates(tokens.separator, state).props;
  const minWidth = resolveTokenStates(tokens.overflowButton, state).style.minWidth;
  const triggerWidth = typeof minWidth === 'number' ? minWidth : 0;
  const gap = typeof root.gap === 'number' ? root.gap : 0;
  const ancestors = state.items.slice(0, -1) as BreadcrumbAncestor[];
  const width = state.width - (state.leadingIcon ? (separator.width ?? 0) + gap : 0);
  const partition = partitionTrail(ancestors, state.items.map(state.getWidth), width, gap, separator.width ?? 0, triggerWidth);
  Object.assign(state.layout, partition, { typography, separator, triggerWidth });
  useLayoutEffect(() => state.reconcileFocus(partition));
  attachSlotProps(state.root, { style: [breadcrumbStyles.root, root, state.userStyle] });
  attachSlotProps(state.current, { style: breadcrumbStyles.current });
  attachSlotProps(state.currentLabel, { style: currentStyle, numberOfLines: 1 });
  attachSlotProps(state.measureRow, { style: breadcrumbStyles.probe });
  if (state.leadingIcon) attachSlotDefaults(state.leadingIcon, { width: separator.width, height: separator.height });
}
