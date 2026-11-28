import { defineComponentTokens, enumToken, flexDirectionToken, getGapStyleValue } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { RadioGroupState } from './radio-group.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<RadioGroupState, 'orientation'>;
const slots = {
  root: { style: { gap: getGapStyleValue }, props: {} },
  options: {
    style: { gap: getGapStyleValue, flexDirection: flexDirectionToken, flexWrap: enumToken(['wrap', 'nowrap', 'wrap-reverse']) },
    props: {},
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.radio-group': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const radioGroupTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.radio-group', slots, schema });
