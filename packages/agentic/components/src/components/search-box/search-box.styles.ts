import { StyleSheet } from 'react-native';
import { assetField, defineComponentTokens, dimensionToken, enumToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import { parseSearchIcon, searchBoxAssets } from './search-box.assets';
import type { SearchBoxState } from './search-box.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SearchBoxState, 'size' | 'visualState'>;
const slots = {
  searchIcon: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', searchBoxAssets, parseSearchIcon) } },
  clear: {
    style: { minWidth: dimensionToken },
    props: { appearance: enumToken(['subtle']), size: enumToken(['small']) },
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.search-box': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const searchBoxTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.search-box', slots, schema });
export const searchBoxStyles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  input: { flex: 1, minWidth: 0 },
  clear: { alignSelf: 'center' },
});
