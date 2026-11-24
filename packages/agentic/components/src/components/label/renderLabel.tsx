/** @jsxImportSource @fluentui-react-native/framework-base */
import type { LabelState } from './label.types';

export function renderLabel_unstable(state: LabelState) {
  if (!state.hasText) return null;
  return (
    <state.root>
      <state.row>
        <state.text />
        {state.requiredMark && <state.requiredMark />}
      </state.row>
    </state.root>
  );
}
