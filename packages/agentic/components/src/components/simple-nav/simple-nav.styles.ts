import { StyleSheet } from 'react-native';
import { colorToken, defineComponentTokens, dimensionToken, numericToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SimpleNavState } from './simple-nav.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SimpleNavState, 'presentation' | 'rail'>;
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
    'furn.simple-nav': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const simpleNavTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.simple-nav', slots, schema });
export const simpleNavStyles = StyleSheet.create({
  narrowInsets: { paddingHorizontal: 0 },
  center: { alignItems: 'center' },
});
