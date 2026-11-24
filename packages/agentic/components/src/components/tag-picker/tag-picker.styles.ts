import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  enumToken,
  flexDirectionToken,
  getGapStyleValue,
  numericToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { TagPickerState } from './tag-picker.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<TagPickerState, 'size' | 'visualState'>;
const wrap = { flexDirection: flexDirectionToken, alignItems: alignItemsToken, flexWrap: enumToken(['wrap', 'nowrap', 'wrap-reverse']) };
const slots = {
  control: { style: { ...wrap, minHeight: dimensionToken }, props: {} },
  tags: { style: { ...wrap, gap: getGapStyleValue, flexShrink: numericToken }, props: {} },
  editor: { style: { flexGrow: numericToken }, props: {} },
  chevron: { style: {}, props: { width: numericToken, height: numericToken, color: colorToken } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.tag-picker': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const tagPickerTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.tag-picker', slots, schema });
export const tagPickerStyles = StyleSheet.create({ picker: { minWidth: 120 } });
