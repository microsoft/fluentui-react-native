import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  flexDirectionToken,
  fontWeightToken,
  getGapStyleValue,
  justifyContentToken,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { PersonaState } from './persona.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<PersonaState, 'size' | 'layout' | 'alignment'>;
const text = {
  style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
  props: {},
};
const slots = {
  root: {
    style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, justifyContent: justifyContentToken, gap: getGapStyleValue },
    props: {},
  },
  textColumn: { style: { flexShrink: numericToken }, props: {} },
  name: text,
  supportingText: text,
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.persona': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const personaTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.persona', slots, schema });
export const personaStyles = StyleSheet.create({
  portrait: { flexShrink: 0 },
  presence: { position: 'absolute', end: 0, bottom: 0 },
});
