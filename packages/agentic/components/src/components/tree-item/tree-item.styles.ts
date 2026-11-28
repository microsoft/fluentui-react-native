import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  fontWeightToken,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { TreeItemState } from './tree-item.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<TreeItemState, 'layout' | 'size' | 'appearance' | 'selected' | 'visualState'>;
const text = { color: colorToken, fontFamily: stringToken, fontWeight: fontWeightToken, fontSize: numericToken, lineHeight: numericToken };
const slots = {
  primary: {
    style: {
      backgroundColor: colorToken,
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      minHeight: dimensionToken,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      borderRadius: dimensionToken,
    },
    props: {},
  },
  label: { style: { ...text, flexShrink: numericToken }, props: {} },
  description: { style: text, props: {} },
  leading: { style: {}, props: iconTokenProps },
  chevron: { style: {}, props: iconTokenProps },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.tree-item': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const treeItemTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.tree-item', slots, schema });
export const treeItemStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  primary: { flex: 1, minWidth: 0 },
  disclosure: { alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  action: { alignSelf: 'center' },
});
