import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  alignSelfToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  getGapStyleValue,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { InteractionTagState } from './interaction-tag.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<InteractionTagState, 'size' | 'shape' | 'appearance'> & {
  visualState: InteractionTagState['primary']['visualState'];
};
const slots = {
  root: { style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, borderRadius: dimensionToken }, props: {} },
  primary: {
    style: {
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      gap: getGapStyleValue,
      paddingHorizontal: dimensionToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  divider: { style: { width: dimensionToken, alignSelf: alignSelfToken, backgroundColor: colorToken }, props: {} },
  remove: { style: { minWidth: dimensionToken }, props: {} },
  removeIcon: { style: {}, props: iconTokenProps },
  content: { style: { color: colorToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.interaction-tag': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const interactionTagTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.interaction-tag', slots, schema });
export const interactionTagStyles = StyleSheet.create({ root: { alignSelf: 'flex-start', maxWidth: '100%' } });
