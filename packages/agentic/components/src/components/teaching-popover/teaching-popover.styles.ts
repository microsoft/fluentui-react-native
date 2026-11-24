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
const text = {
  style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
  props: {},
};
const slots = {
  header: { style: row, props: {} },
  content: { style: { gap: getGapStyleValue }, props: {} },
  title: text,
  body: text,
  image: { style: { borderRadius: dimensionToken }, props: {} },
  footer: { style: { ...row, flexWrap: enumToken(['wrap', 'nowrap', 'wrap-reverse'] as const), marginTop: dimensionToken }, props: {} },
  stepper: text,
};
type TokenState = Record<never, never>;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.teaching-popover': ComponentTokenPatch<TokenState, typeof slots>;
  }
}
export const teachingPopoverTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.teaching-popover', slots, schema });
export const teachingPopoverStyles = StyleSheet.create({
  content: { maxWidth: 280 },
  image: { width: '100%', aspectRatio: 2 },
  title: { flexShrink: 1 },
});
