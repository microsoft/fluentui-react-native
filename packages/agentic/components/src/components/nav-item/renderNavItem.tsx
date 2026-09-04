/** @jsxImportSource @fluentui-react-native/framework-base */
import type { StyleProp, ViewStyle } from 'react-native';

import { CompoundItemLayout } from '../../primitives/compound-item-layout/compound-item-layout';
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';

import { navItemStyles } from './nav-item.styles';
import type { NavItemState } from './nav-item.types';

/**
 * Render the NavItem component.
 */
export function renderNavItem_unstable(state: NavItemState) {
  const ActiveIcon = state.selected && state.selectedIcon ? state.selectedIcon : state.icon;
  const leading = state.avatar ? <state.avatar /> : ActiveIcon ? <ActiveIcon /> : undefined;
  const leadingStyle: StyleProp<ViewStyle> = [navItemStyles.leadingContainer, { marginEnd: state.metrics.leadingGap }];
  const trailing =
    state.trailingActions || state.chevronContainer ? (
      <>
        {state.trailingActions ? <state.trailingActions /> : null}
        {state.chevronContainer && state.chevron ? (
          <state.chevronContainer>
            <state.chevron />
          </state.chevronContainer>
        ) : null}
      </>
    ) : undefined;

  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      <state.selectedIndicator />
      {state.showLabel ? (
        <CompoundItemLayout
          leading={leading}
          leadingStyle={leadingStyle}
          primary={state.label && state.labelHidden ? <LayoutStableText reserve={<state.labelHidden />} visible={<state.label />} /> : null}
          secondary={state.trailingContent ? <state.trailingContent /> : undefined}
          secondaryPosition="right"
          secondaryStyle={{ marginStart: state.metrics.trailingGap }}
          trailing={trailing}
          trailingStyle={{ gap: state.metrics.trailingItemGap, marginStart: state.metrics.trailingGap }}
        />
      ) : (
        leading
      )}
    </state.root>
  );
}
