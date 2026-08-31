/** @jsxImportSource @fluentui-react-native/framework-base */
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { TagState } from './tag.types';

export function renderTag_unstable(state: TagState) {
  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      {state.leadingIcon && <state.leadingIcon />}
      {state.content && <state.content />}
      {state.dismissIcon && state.dismiss && <state.dismissIcon />}
    </state.root>
  );
}
