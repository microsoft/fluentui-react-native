import { StyleSheet } from 'react-native';
import { colorToken, defineComponentTokens, dimensionToken, numericToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SelectState } from './select.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SelectState, 'size' | 'variant' | 'visualState'>;
const slots = {
  root: { style: { backgroundColor: colorToken, minHeight: dimensionToken }, props: {} },
  chrome: { style: { borderWidth: numericToken, borderBottomWidth: numericToken, borderColor: colorToken }, props: {} },
  display: { style: { color: colorToken }, props: {} },
  placeholder: { style: { color: colorToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.select': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const selectTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.select', slots, schema });
export const selectStyles = StyleSheet.create({ picker: { flexGrow: 1, alignSelf: 'stretch' } });
