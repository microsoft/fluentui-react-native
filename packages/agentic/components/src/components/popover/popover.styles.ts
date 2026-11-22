import { StyleSheet } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import {
  borderStyleToken,
  colorToken,
  defineComponentTokens,
  getComponentTokens,
  numericToken,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch, ResolvedSlotTokens } from '@fluentui-react-native/design/styling';
import schema from './spec/tokens.json' with { type: 'json' };

export const popoverStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
});

const slots = {
  surface: {
    style: {
      backgroundColor: colorToken,
      borderColor: colorToken,
      borderRadius: numericToken,
      borderStyle: borderStyleToken,
      borderWidth: numericToken,
      padding: numericToken,
    },
    props: {},
  },
  placement: { style: {}, props: { gap: numericToken } },
};
type SurfaceSlots = typeof slots;
type SurfaceAxes = Record<never, never>;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.popover': ComponentTokenPatch<SurfaceAxes, SurfaceSlots>;
  }
}
const popoverTokenDefinition = defineComponentTokens<SurfaceAxes, SurfaceSlots>({ id: 'furn.popover', slots, schema });

type SurfaceStyle = ResolvedSlotTokens<SurfaceSlots['surface']['style'], SurfaceSlots['surface']['props']>['style'];

export function getPopoverChrome(state: ThemeState): { surface: SurfaceStyle; gap: number } {
  const tokens = getComponentTokens(state, popoverTokenDefinition);
  const surface = resolveTokenStates(tokens.surface, {}).style;
  const { gap = 0 } = resolveTokenStates(tokens.placement, {}).props;
  return { surface, gap: Math.max(0, Math.round(gap)) };
}

export function getPopoverSurfaceStyle(surface: SurfaceStyle): SurfaceStyle {
  return { ...surface, padding: Math.max(0, (surface.padding ?? 0) - (surface.borderWidth ?? 0)) };
}
