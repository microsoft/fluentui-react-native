import { colorToken, defineComponentTokens } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { DestructiveButtonState } from './destructive-button.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<DestructiveButtonState, 'appearance' | 'visualState'>;
const slots = {
  root: { style: { backgroundColor: colorToken }, props: {} },
  content: { style: { color: colorToken }, props: {} },
  icon: { style: {}, props: { color: colorToken } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.destructive-button': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const destructiveButtonTokens = defineComponentTokens<TokenState, typeof slots>({
  id: 'furn.destructive-button',
  slots,
  schema,
});
