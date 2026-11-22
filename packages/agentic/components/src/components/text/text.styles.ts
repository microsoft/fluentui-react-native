import type { TextStyle } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  fontWeightToken,
  getComponentTokens,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { TextState } from './text.types';
import schema from './spec/tokens.json' with { type: 'json' };

const slots = {
  root: {
    style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
    props: {},
  },
};

type TextTokenState = Record<never, never>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.text': ComponentTokenPatch<TextTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<TextTokenState, typeof slots>({ id: 'furn.text', slots, schema });

export function getTextStyles(state: TextState): { root: TextStyle } {
  return { root: resolveTokenStates(getComponentTokens(state, definition).root, state).style };
}
