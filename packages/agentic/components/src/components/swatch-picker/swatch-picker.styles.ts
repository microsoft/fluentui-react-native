import {
  alignItemsToken,
  defineComponentTokens,
  enumToken,
  flexDirectionToken,
  getGapStyleValue,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SwatchPickerState } from './swatch-picker.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SwatchPickerState, 'layout'>;
const slots = {
  collection: {
    style: {
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      gap: getGapStyleValue,
      flexWrap: enumToken(['wrap', 'nowrap', 'wrap-reverse']),
      alignContent: enumToken(['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']),
    },
    props: {},
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.swatch-picker': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const swatchPickerTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.swatch-picker', slots, schema });
