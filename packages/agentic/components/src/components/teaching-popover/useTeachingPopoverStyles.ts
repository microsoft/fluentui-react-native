import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { teachingPopoverStyles, teachingPopoverTokens } from './teaching-popover.styles';
import type { TeachingPopoverState } from './teaching-popover.types';

export function useTeachingPopoverStyles_unstable(state: TeachingPopoverState) {
  const tokens = getComponentTokens(state, teachingPopoverTokens);
  attachSlotProps(state.content, { style: [teachingPopoverStyles.content, resolveTokenStates(tokens.content, state).style] });
  attachSlotProps(state.header, { style: resolveTokenStates(tokens.header, state).style });
  attachSlotProps(state.title, { style: [teachingPopoverStyles.title, resolveTokenStates(tokens.title, state).style] });
  if (state.body) attachSlotProps(state.body, { style: resolveTokenStates(tokens.body, state).style });
  if (state.image) attachSlotProps(state.image, { style: [teachingPopoverStyles.image, resolveTokenStates(tokens.image, state).style] });
  if (state.footer) attachSlotProps(state.footer, { style: resolveTokenStates(tokens.footer, state).style });
  if (state.progress) attachSlotProps(state.progress, { style: resolveTokenStates(tokens.stepper, state).style });
}
