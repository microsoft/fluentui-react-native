import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  assetField,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  enumToken,
  flexDirectionToken,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import { parseStatusAsset, statusAssets } from './message-bar.assets';
import type { MessageBarState } from './message-bar.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<MessageBarState, 'status'>;
const slots = {
  root: { style: { backgroundColor: colorToken, borderRadius: dimensionToken, gap: getGapStyleValue, padding: dimensionToken }, props: {} },
  tint: { style: { backgroundColor: colorToken }, props: {} },
  statusIcon: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', statusAssets, parseStatusAsset) } },
  content: {
    style: {
      color: colorToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      fontWeight: fontWeightToken,
      lineHeight: numericToken,
      flexShrink: numericToken,
    },
    props: {},
  },
  actions: {
    style: {
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      flexWrap: enumToken(['wrap', 'nowrap', 'wrap-reverse'] as const),
      gap: getGapStyleValue,
    },
    props: {},
  },
  dismiss: {
    style: {},
    props: {
      size: enumToken(['small', 'medium', 'large'] as const),
      appearance: enumToken(['primary', 'secondary', 'outline', 'subtle'] as const),
    },
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.message-bar': ComponentTokenPatch<TokenState, typeof slots>;
  }
}
export const messageBarTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.message-bar', slots, schema });
export const messageBarStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  message: { flex: 1, minWidth: 0 },
});
