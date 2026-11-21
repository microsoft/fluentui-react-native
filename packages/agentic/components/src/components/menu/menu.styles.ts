import { StyleSheet } from 'react-native';

import type { FlexTokens, ThemeState } from '@fluentui-react-native/design';
import {
  defineComponentTokens,
  getComponentTokens,
  getNumericStyleValue,
  numericToken,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { getPopoverChrome } from '../popover/popover.styles';
import schema from './spec/tokens.json' with { type: 'json' };

export const menuStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
});

const slots = { surface: { style: { padding: numericToken, gap: numericToken }, props: {} } };
type MenuSlots = typeof slots;
type MenuAxes = Record<never, never>;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu': ComponentTokenPatch<MenuAxes, MenuSlots>;
  }
}
const menuTokenDefinition = defineComponentTokens<MenuAxes, MenuSlots>({ id: 'furn.menu', slots, schema });

/** Popover's surface bindings with Menu's tighter padding; rows stack without a gap. */
export function getMenuThemeStyles(state: ThemeState) {
  const popover = getPopoverChrome(state);
  const tokens = getComponentTokens(state, menuTokenDefinition);
  const surface = resolveTokenStates(tokens.surface, {}).style;
  return { surface: { ...popover.surface, ...surface }, gap: popover.gap };
}

/** The trigger-to-menu and row-to-submenu gap. Native placement requires a nonnegative integer in logical units. */
export function getMenuGap(tokens: FlexTokens): number {
  return Math.max(0, Math.round(Number(getNumericStyleValue(tokens.spacing.componentBase100))));
}
