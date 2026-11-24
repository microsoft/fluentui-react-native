/** @jsxImportSource @fluentui-react-native/framework-base */
import type { PersonaState } from './persona.types';

export function renderPersona_unstable(state: PersonaState) {
  if (!state.hasName) return null;
  return (
    <state.root>
      <state.portrait>
        <state.avatar />
        {state.presence && <state.presence />}
      </state.portrait>
      <state.textColumn>
        <state.name />
        {state.secondary && <state.secondary />}
        {state.tertiary && <state.tertiary />}
        {state.quaternary && <state.quaternary />}
      </state.textColumn>
    </state.root>
  );
}
