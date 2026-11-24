/** @jsxImportSource @fluentui-react-native/framework-base */
import { renderButton_unstable } from '../button/renderButton';
import type { InteractionTagState } from './interaction-tag.types';

export function renderInteractionTag_unstable(state: InteractionTagState) {
  if (!state.named) return null;
  const { primary } = state;
  return (
    <state.root>
      <primary.root ref={primary.focusTargetRef}>
        {primary.FocusRing && <primary.FocusRing />}
        {state.avatar && <state.avatar />}
        {primary.leadingIcon && <primary.leadingIcon />}
        {primary.content && <primary.content />}
      </primary.root>
      <state.divider />
      {renderButton_unstable(state.remove)}
    </state.root>
  );
}
