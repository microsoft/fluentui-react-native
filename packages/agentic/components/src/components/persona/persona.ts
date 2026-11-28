import type { PersonaProps } from './persona.types';
import { renderPersona_unstable } from './renderPersona';
import { usePersona_unstable } from './usePersona';
import { usePersonaStyles_unstable } from './usePersonaStyles';

export function Persona(props: PersonaProps) {
  const state = usePersona_unstable(props);
  usePersonaStyles_unstable(state);
  return renderPersona_unstable(state);
}
Persona.displayName = 'Persona';
