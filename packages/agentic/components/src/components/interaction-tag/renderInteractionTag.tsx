/** @jsxImportSource @fluentui-react-native/framework-base */
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { InteractionTagState } from './interaction-tag.types';

export function renderInteractionTag_unstable(state: InteractionTagState) {
  return (
    <state.root>
      <state.primaryAction>
        <FocusVisual {...state.primaryFocusVisualProps} />
        {state.avatar && <state.avatar />}
        {state.leadingIcon && <state.leadingIcon />}
        {state.content && <state.content />}
      </state.primaryAction>
      <state.divider />
      <state.dismiss>
        <FocusVisual {...state.dismissFocusVisualProps} />
        {state.dismissIcon && <state.dismissIcon />}
      </state.dismiss>
    </state.root>
  );
}
