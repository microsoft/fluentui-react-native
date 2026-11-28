import { StyleSheet } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { RatingDisplaySize } from './rating-display.types';
import schema from './spec/tokens.json' with { type: 'json' };

const text = {
  style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
  props: {},
};
const slots = {
  root: { style: { gap: getGapStyleValue }, props: {} },
  stars: { style: { gap: getGapStyleValue }, props: {} },
  value: text,
  count: text,
};
type TokenState = { size: RatingDisplaySize };

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.rating-display': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const ratingDisplayTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.rating-display', slots, schema });

export const ratingDisplayStyles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
});
