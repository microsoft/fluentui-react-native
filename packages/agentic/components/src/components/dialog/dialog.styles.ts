import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
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
import schema from './spec/tokens.json' with { type: 'json' };

const row = { flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue };
const slots = {
  surface: {
    style: {
      backgroundColor: colorToken,
      borderRadius: dimensionToken,
      width: dimensionToken,
      maxWidth: dimensionToken,
      padding: dimensionToken,
      gap: getGapStyleValue,
    },
    props: {},
  },
  scrim: { style: { backgroundColor: colorToken }, props: {} },
  header: { style: row, props: {} },
  title: {
    style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, lineHeight: numericToken, fontWeight: fontWeightToken },
    props: {},
  },
  body: { style: { flexShrink: numericToken }, props: {} },
  footer: { style: { ...row, flexWrap: enumToken(['wrap', 'nowrap', 'wrap-reverse']) }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.dialog': ComponentTokenPatch<Record<never, never>, typeof slots>;
  }
}

export const dialogTokens = defineComponentTokens<Record<never, never>, typeof slots>({ id: 'furn.dialog', slots, schema });
export const dialogStyles = StyleSheet.create({
  window: { position: 'absolute', top: 0, start: 0 },
  title: { flexShrink: 1, flexGrow: 1 },
  stack: { flexDirection: 'column', alignItems: 'stretch' },
});
