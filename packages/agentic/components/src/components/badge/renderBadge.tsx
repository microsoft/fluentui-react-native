/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
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
      {state.tintStyle && <View {...hiddenFromAccessibilityProps} pointerEvents="none" style={state.tintStyle} />}
      {LeadingIcon && <LeadingIcon />}
      {Content && <Content />}
      {TrailingIcon && <TrailingIcon />}
    </state.root>
  );
}
