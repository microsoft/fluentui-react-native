import { colorToken, defineComponentTokens, dimensionToken, numericToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { NavState } from './nav.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<NavState, 'presentation'>;
const inset = { paddingHorizontal: dimensionToken, paddingVertical: dimensionToken };
const slots = {
  panel: {
    style: {
      backgroundColor: colorToken,
      width: dimensionToken,
      maxWidth: dimensionToken,
      borderEndWidth: numericToken,
      borderColor: colorToken,
    },
    props: {},
  },
  header: { style: inset, props: {} },
  body: { style: { ...inset, flexShrink: numericToken }, props: {} },
  footer: { style: inset, props: {} },
  scrim: { style: { backgroundColor: colorToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.nav': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const navTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.nav', slots, schema });
