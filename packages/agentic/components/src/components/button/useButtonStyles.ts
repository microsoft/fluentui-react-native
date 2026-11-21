import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { resolveButtonChrome } from './button.styles';
import type { ButtonState } from './button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * button slots.
 */
export function useButtonStyles_unstable(state: ButtonState) {
  applyButtonChrome(state, resolveButtonChrome(state), { trailing: !!state.trailingIcon });
}

/** Apply effective Button visuals to both Button and MenuButton triggers. */
export function applyButtonChrome(
  state: ButtonState,
  { root, content, icon }: ReturnType<typeof resolveButtonChrome>,
  iconEdges?: { trailing: boolean },
) {
  const style = [root, iconEdges && getIconEdgePadding(state, root.paddingHorizontal, iconEdges.trailing), state.userStyle];
  if (state.FocusRing) applyFocusRingStyles(state.FocusRing, state.themeState, StyleSheet.flatten(style).borderRadius);
  attachSlotProps(state.root, { style });
  if (state.content) attachSlotDefaults(state.content, { style: content });
  for (const slot of [state.leadingIcon, state.trailingIcon]) {
    if (slot) {
      attachSlotDefaults(slot, { ...icon, color: icon.color ?? content.color });
      attachSlotProps(slot, { accessible: false });
    }
  }
}

function getIconEdgePadding(state: ButtonState, padding: ViewStyle['paddingHorizontal'], trailing: boolean): ViewStyle | undefined {
  if (state.iconOnly || (!state.leadingIcon && !trailing) || typeof padding !== 'number') return undefined;
  const caller = StyleSheet.flatten(state.userStyle);
  if (
    caller?.padding != null ||
    caller?.paddingHorizontal != null ||
    caller?.paddingInline != null ||
    caller?.paddingLeft != null ||
    caller?.paddingRight != null
  ) {
    return undefined;
  }

  // Icons have space around the visible glyph inside their layout frame.
  const inset = Number(state.tokens.spacing.componentBase100);
  if (!Number.isFinite(inset)) return undefined;
  const compact = Math.max(0, padding - inset);
  return { ...(state.leadingIcon && { paddingStart: compact }), ...(trailing && { paddingEnd: compact }) };
}
