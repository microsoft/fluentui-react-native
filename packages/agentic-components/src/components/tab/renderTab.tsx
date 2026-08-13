/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TabState } from './tab.types';

/**
 * Render the Tab component.
 */
export function renderTab_unstable(state: TabState) {
  const ActiveIcon = state.selected ? state.selectedIcon ?? state.icon : state.icon;
  const Content = state.content;
  const ContentContainer = state.contentContainer;
  const ContentHidden = state.contentHidden;
  const contentElement = Content && ContentContainer && ContentHidden ? (
    <ContentContainer>
      <ContentHidden />
      <Content />
    </ContentContainer>
  ) : null;

  return (
    <state.root>
      {ActiveIcon && <ActiveIcon />}
      {contentElement}
    </state.root>
  );
}
