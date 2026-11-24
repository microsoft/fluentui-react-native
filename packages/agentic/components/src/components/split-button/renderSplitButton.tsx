/** @jsxImportSource @fluentui-react-native/framework-base */
import { renderButton_unstable } from '../button/renderButton';
import { renderMenuButton_unstable } from '../menu-button/renderMenuButton';
import type { SplitButtonState } from './split-button.types';

export function renderSplitButton_unstable(state: SplitButtonState) {
  if (!state.hasNames) return null;
  return (
    <state.root>
      {renderButton_unstable(state.primary)}
      <state.divider />
      {renderMenuButton_unstable(state.menuButton)}
    </state.root>
  );
}
