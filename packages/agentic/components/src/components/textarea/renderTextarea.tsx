/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TextareaState } from './textarea.types';

export function renderTextarea_unstable(state: TextareaState) {
  return (
    <state.root>
      <state.textInput ref={state.focusTargetRef} />
      {state.FocusRing && <state.FocusRing />}
    </state.root>
  );
}
