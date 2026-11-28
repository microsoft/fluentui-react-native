import type { InteractionTagProps } from './interaction-tag.types';
import { renderInteractionTag_unstable } from './renderInteractionTag';
import { useInteractionTag_unstable } from './useInteractionTag';
import { useInteractionTagStyles_unstable } from './useInteractionTagStyles';

export function InteractionTag(props: InteractionTagProps) {
  const state = useInteractionTag_unstable(props);
  useInteractionTagStyles_unstable(state);
  return renderInteractionTag_unstable(state);
}
InteractionTag.displayName = 'InteractionTag';
