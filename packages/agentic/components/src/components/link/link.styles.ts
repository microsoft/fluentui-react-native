import {
  alignItemsToken,
  alignSelfToken,
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
import type { LinkState } from './link.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<LinkState, 'typography' | 'visualState'>;
const slots = {
  root: {
    style: {
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      maxWidth: dimensionToken,
      gap: getGapStyleValue,
      borderRadius: dimensionToken,
    },
    props: {},
  },
  content: {
    style: {
      color: colorToken,
      flexShrink: numericToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      fontWeight: fontWeightToken,
      lineHeight: numericToken,
      textDecorationLine: enumToken(['none', 'underline']),
    },
    props: {},
  },
  trailingIcon: { style: {}, props: iconTokenProps },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.link': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const linkTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.link', slots, schema });
