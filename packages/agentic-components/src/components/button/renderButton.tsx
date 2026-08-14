/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ButtonState } from './button.types';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';

/**
 * Render the Button component
 * @param state The state of the Button component containing slots and other state information.
 * @returns The rendered Button component.
 */
export function renderButton_unstable(state: ButtonState) {
  const { content, contentHidden: ContentHidden, iconPosition, isToggleButton } = state;
  const ActiveIcon = state.selected ? (state.selectedIcon ?? state.icon) : state.icon;
  const Content = content;
  const contentElement =
    Content && isToggleButton && ContentHidden ? (
      <LayoutStableText reserve={<ContentHidden />} visible={<Content />} />
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
