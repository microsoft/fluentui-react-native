import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { spinButtonStyles, spinButtonTokens } from './spin-button.styles';
import type { SpinButtonState } from './spin-button.types';

export function useSpinButtonStyles_unstable(state: SpinButtonState) {
  const tokens = getComponentTokens(state, spinButtonTokens);
  const editor = resolveTokenStates(tokens.editor, state).style;
  const { color, borderRadius, strokeWidth } = state.tokens;
  const stroke =
    state.visualState === 'disabled'
      ? color.strokeNeutralDisabled.rest
      : state.invalid
        ? color.strokeDangerLoud.rest
        : color.strokeNeutralLoud.rest;
  attachSlotProps(state.root, {
    style: [
      {
        borderRadius: state.variant === 'outline' ? borderRadius.base300 : undefined,
        borderWidth: state.variant === 'outline' ? strokeWidth.thin : undefined,
        borderBottomWidth: state.variant === 'underline' ? strokeWidth.thin : undefined,
        borderColor: stroke,
      },
      state.userStyle,
    ],
  });
  attachSlotProps(state.editor, {
    style: [editor, spinButtonStyles.editor, { minHeight: state.size === 'small' ? 24 : state.size === 'large' ? 40 : 32 }],
  });
}
