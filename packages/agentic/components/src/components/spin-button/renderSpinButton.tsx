/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SpinButtonState } from './spin-button.types';

export function renderSpinButton_unstable(state: SpinButtonState) {
  return (
    <state.root>
      <state.editor />
    </state.root>
  );
}
