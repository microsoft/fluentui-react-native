/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TabState } from './tab.types';
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';

/**
 * Render the Tab component.
 */
export function renderTab_unstable(state: TabState) {
  const ActiveIcon = state.selected ? (state.selectedIcon ?? state.icon) : state.icon;
  const Content = state.content;
  const ContentHidden = state.contentHidden;
  const contentElement = Content && ContentHidden ? <LayoutStableText reserve={<ContentHidden />} visible={<Content />} /> : null;

  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      {ActiveIcon && <ActiveIcon />}
      {contentElement}
    </state.root>
  );
}
