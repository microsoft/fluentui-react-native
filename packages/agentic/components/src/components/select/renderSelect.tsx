/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SelectState } from './select.types';

export function renderSelect_unstable(state: SelectState) {
  return (
    <state.root>
      <state.picker />
    </state.root>
  );
}
