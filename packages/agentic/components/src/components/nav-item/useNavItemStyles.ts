import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';

import {
  getNavItemBackgroundStyle,
  getNavItemChevronRotation,
  getNavItemForegroundStyle,
  getNavItemIndicatorStyle,
  getNavItemLabelStyle,
  getNavItemRootSizeStyle,
  getNavItemTrailingContentStyle,
  navItemStyles,
} from './nav-item.styles';
import type { NavItemState } from './nav-item.types';

/**
 * Applies stable theme styles and instance-specific style selections to the NavItem slots.
 */
export function useNavItemStyles_unstable(state: NavItemState) {
  const rootSizeStyle = getNavItemRootSizeStyle(state);
  const rootStyle: StyleProp<ViewStyle> = [
    navItemStyles.root,
    state.showLabel ? navItemStyles.rootLabeled : navItemStyles.rootRail,
    rootSizeStyle,
    getNavItemBackgroundStyle(state),
    state.userStyle,
  ];
  const labelStyle: StyleProp<TextStyle> = [getNavItemLabelStyle(state), getNavItemForegroundStyle(state, 'label')];
  const hiddenLabelStyle: StyleProp<TextStyle> = getNavItemLabelStyle(state, true);
  const trailingContentStyle: StyleProp<TextStyle> = [
    getNavItemTrailingContentStyle(state),
    getNavItemForegroundStyle(state, 'secondary'),
    navItemStyles.trailingContent,
  ];
  const selectedIndicatorStyle: StyleProp<ViewStyle> = [
    navItemStyles.selectedIndicator,
    getNavItemIndicatorStyle(state),
    {
      borderRadius: state.tokens.borderRadius.circular,
      bottom: state.metrics.indicatorInsetVertical,
      start: state.metrics.indicatorInsetStart,
      top: state.metrics.indicatorInsetVertical,
      width: state.metrics.indicatorWidth,
    },
  ];
  const leadingIconColor = getNavItemForegroundStyle(state, 'leadingIcon').color;
  const secondaryColor = getNavItemForegroundStyle(state, 'secondary').color;

  state.focusVisualProps = createFocusVisualProps_unstable({
    borderRadius: rootSizeStyle.borderRadius,
    innerColor: state.tokens.color.strokeFocusInner,
    innerWidth: state.tokens.strokeWidth.thin,
    outerColor: state.tokens.color.strokeFocusOuter,
    outerWidth: state.tokens.strokeWidth.thick,
    visible: state.focused && !state.disabled,
  });

  attachSlotProps(state.selectedIndicator, { accessible: false, style: selectedIndicatorStyle });

  if (state.label) {
    attachSlotProps(state.label, { style: labelStyle });
  }

  if (state.labelHidden) {
    attachSlotProps(state.labelHidden, { style: hiddenLabelStyle });
  }

  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: leadingIconColor,
      height: state.metrics.leadingSize,
      width: state.metrics.leadingSize,
    });
  }

  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: leadingIconColor,
      height: state.metrics.leadingSize,
      width: state.metrics.leadingSize,
    });
  }

  if (state.avatar) {
    attachSlotProps(state.avatar, { accessible: false, size: state.metrics.avatarSize });
  }

  if (state.trailingContent) {
    attachSlotProps(state.trailingContent, { style: trailingContentStyle });
  }

  if (state.trailingActions) {
    attachSlotProps(state.trailingActions, {
      style: [navItemStyles.trailingContainer, { gap: state.metrics.trailingItemGap }],
    });
  }

  if (state.chevronContainer) {
    attachSlotProps(state.chevronContainer, {
      accessible: false,
      style: { transform: [{ rotate: getNavItemChevronRotation(state.expanded) }] },
    });
  }

  if (state.chevron) {
    attachSlotProps(state.chevron, {
      accessible: false,
      color: secondaryColor,
      height: state.metrics.chevronSize,
      width: state.metrics.chevronSize,
    });
  }

  attachSlotProps(state.root, { style: rootStyle });
}
