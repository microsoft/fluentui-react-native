import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import { renderInteractionTag_unstable } from './renderInteractionTag';
import type { InteractionTagProps } from './interaction-tag.types';
import { useInteractionTagStyles_unstable } from './useInteractionTagStyles';
import { useInteractionTag_unstable } from './useInteractionTag';

export const InteractionTag = phasedComponent<InteractionTagProps>((props) => {
  const state = useInteractionTag_unstable(props);
  useInteractionTagStyles_unstable(state);
  return directComponent<InteractionTagProps>(() => renderInteractionTag_unstable(state));
});

InteractionTag.displayName = 'InteractionTag';

export default InteractionTag;
