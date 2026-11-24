import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { fieldStyles, fieldTokens } from './field.styles';
import type { FieldState } from './field.types';

export function useFieldStyles_unstable(state: FieldState) {
  const tokens = getComponentTokens(state, fieldTokens);
  const horizontal = state.orientation === 'horizontal';
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
  if (horizontal && state.label) attachSlotProps(state.label, { style: fieldStyles.label });
  if (horizontal && state.infoLabel) attachSlotProps(state.infoLabel, { style: fieldStyles.label });
  attachSlotProps(state.controlColumn, {
    style: [fieldStyles.controlColumn, resolveTokenStates(tokens.controlColumn, state).style, horizontal && fieldStyles.horizontalControl],
  });
  if (state.messageStack) attachSlotProps(state.messageStack, { style: resolveTokenStates(tokens.messageStack, state).style });
  if (state.helperLabel) attachSlotProps(state.helperLabel, { style: resolveTokenStates(tokens.helper, state).style });
  if (state.validationRow) attachSlotProps(state.validationRow, { style: resolveTokenStates(tokens.validationRow, state).style });
  const { flexShrink, ...validationText } = resolveTokenStates(tokens.validationText, state).style;
  if (state.validationText) attachSlotProps(state.validationText, { style: { flexShrink } });
  if (state.validationLabel) attachSlotProps(state.validationLabel, { style: validationText });
  if (state.validationIcon) {
    const { source: svgSource, ...icon } = resolveTokenStates(tokens.validationIcon, state).props;
    attachSlotProps(state.validationIcon, { ...icon, svgSource });
  }
}
