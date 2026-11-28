/** @jsxImportSource @fluentui-react-native/framework-base */
import type { CompoundButtonState } from './compound-button.types';

export function renderCompoundButton_unstable(state: CompoundButtonState) {
  return (
    <state.root ref={state.focusTargetRef}>
      {state.FocusRing && <state.FocusRing />}
      {state.image && <state.image />}
      <state.textStack>
        {state.content && <state.content />}
        <state.description />
      </state.textStack>
    </state.root>
  );
}
