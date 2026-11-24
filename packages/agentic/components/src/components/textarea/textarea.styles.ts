import { StyleSheet } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  enumToken,
  fontWeightToken,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { TextareaState } from './textarea.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<TextareaState, 'size' | 'visualState'>;
const slots = {
  root: {
    style: {
      backgroundColor: colorToken,
      borderRadius: dimensionToken,
      borderColor: colorToken,
      borderWidth: numericToken,
      minHeight: dimensionToken,
    },
    props: {},
  },
  editor: {
    style: {
      fontFamily: stringToken,
      fontSize: numericToken,
      lineHeight: numericToken,
      fontWeight: fontWeightToken,
      color: colorToken,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      textAlignVertical: enumToken(['auto', 'top', 'bottom', 'center'] as const),
    },
    props: { placeholderTextColor: colorToken },
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.textarea': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const textareaTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.textarea', slots, schema });
export const textareaStyles = StyleSheet.create({ editor: { flex: 1, minWidth: 0 } });
