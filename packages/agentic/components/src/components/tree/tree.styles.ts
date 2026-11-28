import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  enumToken,
  flexDirectionToken,
  getGapStyleValue,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { TreeState } from './tree.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<TreeState, 'size'>;
const slots = {
  root: {
    style: { backgroundColor: colorToken, flexDirection: flexDirectionToken, gap: getGapStyleValue, padding: dimensionToken },
    props: {},
  },
  item: { style: {}, props: { size: enumToken(['small', 'medium']) } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.tree': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const treeTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.tree', slots, schema });
