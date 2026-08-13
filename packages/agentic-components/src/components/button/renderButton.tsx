/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ButtonState } from './button.types';

/**
 * Render the Button component
 * @param state The state of the Button component containing slots and other state information.
 * @returns The rendered Button component.
 */
export function renderButton_unstable(state: ButtonState) {
  const { content, contentContainer: ContentContainer, contentHidden: ContentHidden, iconPosition, isToggleButton } = state;
  const ActiveIcon = state.selected ? (state.selectedIcon ?? state.icon) : state.icon;
  const Content = content;
  const contentElement =
    Content && isToggleButton && ContentContainer && ContentHidden ? (
      <ContentContainer>
        <ContentHidden />
        <Content />
      </ContentContainer>
    ) : (
      Content && <Content />
    );

  return (
    <state.root>
      {iconPosition === 'before' && ActiveIcon && <ActiveIcon />}
      {contentElement}
      {iconPosition === 'after' && ActiveIcon && <ActiveIcon />}
    </state.root>
  );
}
