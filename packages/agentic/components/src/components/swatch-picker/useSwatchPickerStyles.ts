import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { swatchPickerTokens } from './swatch-picker.styles';
import type { SwatchPickerState } from './swatch-picker.types';

export function useSwatchPickerStyles_unstable(state: SwatchPickerState) {
  const tokens = getComponentTokens(state, swatchPickerTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.collection, state).style, state.userStyle] });
}
