/** @jsxImportSource @fluentui-react-native/framework-base */
import type { BadgeState } from './badge.types';

/**
 * Renders Badge with resolved slot ordering.
 */
export function renderBadge_unstable(state: BadgeState) {
  const LeadingIcon = state.leadingIcon;
  const Content = state.content;
  const TrailingIcon = state.trailingIcon;

  return (
    <state.root>
      {LeadingIcon && <LeadingIcon />}
      {Content && <Content />}
      {TrailingIcon && <TrailingIcon />}
    </state.root>
  );
}
