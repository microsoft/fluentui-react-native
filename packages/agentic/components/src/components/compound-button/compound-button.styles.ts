import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  flexDirectionToken,
  fontWeightToken,
  justifyContentToken,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { CompoundButtonState } from './compound-button.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<CompoundButtonState, 'appearance' | 'size' | 'visualState'>;
const slots = {
  root: {
    style: {
      alignItems: alignItemsToken,
      flexDirection: flexDirectionToken,
      justifyContent: justifyContentToken,
      maxWidth: numericToken,
      minHeight: numericToken,
    },
    props: {},
  },
  image: { style: { width: numericToken, height: numericToken, borderRadius: numericToken }, props: {} },
  contentStack: { style: { flexShrink: numericToken, alignItems: alignItemsToken }, props: {} },
  description: {
    style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
    props: {},
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.compound-button': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const compoundButtonTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.compound-button', slots, schema });
