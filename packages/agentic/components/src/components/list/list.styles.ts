import { StyleSheet } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  enumToken,
  flexDirectionToken,
  getGapStyleValue,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { ListState } from './list.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<ListState, 'size'>;
const slots = {
  root: {
    style: { backgroundColor: colorToken, flexDirection: flexDirectionToken, gap: getGapStyleValue, padding: dimensionToken },
    props: {},
  },
  item: { style: {}, props: { size: enumToken(['small', 'medium', 'large']) } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.list': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const listTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.list', slots, schema });
export const readingRow = StyleSheet.create({
  root: { paddingHorizontal: 8, minHeight: 32, flexDirection: 'row', gap: 4, alignItems: 'center' },
  copy: { minWidth: 0, flexShrink: 1 },
  small: { minHeight: 24 },
  medium: {},
  large: { minHeight: 40 },
});
