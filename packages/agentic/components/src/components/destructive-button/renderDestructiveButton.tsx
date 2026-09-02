/** @jsxImportSource @fluentui-react-native/framework-base */
import type { DestructiveButtonState } from './destructive-button.types';
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';

/**
 * Render the DestructiveButton component
 * @param state The state of the DestructiveButton component containing slots and other state information.
 * @returns The rendered DestructiveButton component.
 */
export function renderDestructiveButton_unstable(state: DestructiveButtonState) {
  const { content: Content, icon: ActiveIcon, iconPosition } = state;

  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      {iconPosition === 'before' && ActiveIcon && <ActiveIcon />}
      {Content && <Content />}
      {iconPosition === 'after' && ActiveIcon && <ActiveIcon />}
    </state.root>
  );
}
