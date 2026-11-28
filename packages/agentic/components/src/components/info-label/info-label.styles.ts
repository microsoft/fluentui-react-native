import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  assetField,
  defineComponentTokens,
  dimensionToken,
  enumToken,
  flexDirectionToken,
  getGapStyleValue,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SvgIconSource } from '../../primitives/icon/icon.types';
import { infoLabelAssets } from './info-label.assets';
import type { InfoLabelState } from './info-label.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<InfoLabelState, 'size'>;
const slots = {
  root: { style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue }, props: {} },
  trigger: {
    style: {},
    props: {
      appearance: enumToken(['subtle']),
      size: enumToken(['small', 'medium']),
    },
  },
  icon: {
    style: {},
    props: {
      source: assetField('fluent-icon', infoLabelAssets, (value): SvgIconSource => {
        if (typeof value !== 'function') throw new TypeError('Expected an InfoLabel glyph');
        return value as SvgIconSource;
      }),
    },
  },
  surface: { style: { width: dimensionToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.info-label': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const infoLabelTokens = defineComponentTokens<TokenState, typeof slots>({
  id: 'furn.info-label',
  slots,
  schema,
});
export const infoLabelStyles = StyleSheet.create({ label: { flexShrink: 1, minWidth: 0 } });
