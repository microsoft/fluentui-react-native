/** @jsxImportSource @fluentui-react-native/framework-base */
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { CardState } from './card.types';

/**
 * Render the Card component.
 */
export function renderCard_unstable(state: CardState) {
  const shouldRenderSlots = state.layout === 'structured';
  const shouldRenderNestedContent = state.layout === 'nested' || state.layout === 'structured';

  return (
    <state.root>
      {state.overlay && (
        <state.overlay>
          <FocusVisual {...state.focusVisualProps} />
        </state.overlay>
      )}
      {shouldRenderSlots && state.header && <state.header />}
      <state.content />
      {shouldRenderNestedContent && state.content02 && <state.content02 />}
      {shouldRenderSlots && state.footer && <state.footer />}
    </state.root>
  );
}
