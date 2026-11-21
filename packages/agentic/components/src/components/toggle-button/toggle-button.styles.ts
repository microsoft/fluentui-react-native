import { colorToken, defineComponentTokens, fontWeightToken } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens } from '@fluentui-react-native/design/styling';
import type { ToggleButtonTokenState } from './toggle-button.types';
import schema from './spec/tokens.json' with { type: 'json' };

const slots = {
  root: { style: { backgroundColor: colorToken, borderColor: colorToken }, props: {} },
  content: { style: { color: colorToken, fontWeight: fontWeightToken }, props: {} },
};

export type ToggleButtonTokens = CompiledComponentTokens<ToggleButtonTokenState, typeof slots>;

export const toggleButtonTokenDefinition = defineComponentTokens<ToggleButtonTokenState, typeof slots>({
  id: 'furn.toggle-button',
  slots,
  schema,
});
