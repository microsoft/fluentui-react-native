import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  flexDirectionToken,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { LabelState } from './label.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<LabelState, 'size' | 'weight' | 'muted'>;
const text = {
  style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
  props: {},
};
const slots = {
  root: { style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue }, props: {} },
  text: { style: { ...text.style, flexShrink: numericToken }, props: {} },
  requiredMark: text,
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.label': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const labelTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.label', slots, schema });
