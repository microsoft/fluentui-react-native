import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { personaStyles, personaTokens } from './persona.styles';
import type { PersonaState } from './persona.types';

export function usePersonaStyles_unstable(state: PersonaState) {
  const tokens = getComponentTokens(state, personaTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
  attachSlotProps(state.portrait, { style: personaStyles.portrait });
  if (state.presence) attachSlotProps(state.presence, { style: personaStyles.presence });
  attachSlotProps(state.textColumn, { style: resolveTokenStates(tokens.textColumn, state).style });
  attachSlotProps(state.name, { style: resolveTokenStates(tokens.name, state).style });
  const style = resolveTokenStates(tokens.supportingText, state).style;
  for (const slot of [state.secondary, state.tertiary, state.quaternary]) {
    if (slot) attachSlotProps(slot, { style });
  }
}
