import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import {
  getListItemBackgroundStyle,
  getListItemContentStyle,
  getListItemFocusStyle,
  getListItemPrimaryForegroundStyle,
  getListItemRootSizeStyle,
  getListItemSecondaryContentStyle,
  getListItemSecondaryForegroundStyle,
  listItemStyles,
} from './list-item.styles';
import type { ListItemState } from './list-item.types';

/**
 * Applies stable theme styles and instance-specific style selections to the ListItem slots.
 */
export function useListItemStyles_unstable(state: ListItemState) {
  const rootStyle: StyleProp<ViewStyle> = [
    listItemStyles.root,
    getListItemRootSizeStyle(state),
    getListItemBackgroundStyle(state),
    getListItemFocusStyle(state),
    state.userStyle,
  ];
  const contentStyle: StyleProp<TextStyle> = getListItemContentStyle(state);
  const hiddenContentStyle: StyleProp<TextStyle> = getListItemContentStyle(state, true);
  const secondaryContentStyle: StyleProp<TextStyle> = [
    getListItemSecondaryContentStyle(state),
    getListItemSecondaryForegroundStyle(state),
    state.secondaryContentPosition === 'right' ? listItemStyles.secondaryRight : { marginTop: state.metrics.contentGap },
  ];
  const selectionIndicatorStyle: StyleProp<TextStyle> = [
    listItemStyles.selectionIndicator,
    getListItemPrimaryForegroundStyle(state),
    {
      height: state.metrics.selectionIndicatorSize,
      width: state.metrics.selectionIndicatorSize,
      fontSize: state.metrics.selectionIndicatorSize,
      lineHeight: state.metrics.selectionIndicatorSize,
      marginEnd: state.metrics.selectionIndicatorMargin,
    },
  ];
  const trailingStyle: StyleProp<ViewStyle> = [
    listItemStyles.trailingContainer,
    {
      gap: state.metrics.trailingGap,
      marginStart: state.metrics.trailingMargin,
    },
  ];
  const avatarStyle: StyleProp<ViewStyle> = [
    listItemStyles.avatar,
    {
      borderRadius: state.metrics.avatarSize / 2,
      height: state.metrics.avatarSize,
      width: state.metrics.avatarSize,
    },
  ];

  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.content, { style: contentStyle });
  attachSlotProps(state.contentHidden, {
    style: hiddenContentStyle,
  });

  if (state.secondaryContent) {
    attachSlotProps(state.secondaryContent, {
      style: secondaryContentStyle,
    });
  }

  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: getListItemPrimaryForegroundStyle(state).color,
      height: state.metrics.iconSize,
      width: state.metrics.iconSize,
    });
  }

  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: getListItemPrimaryForegroundStyle(state).color,
      height: state.metrics.iconSize,
      width: state.metrics.iconSize,
    });
  }

  if (state.avatar) {
    attachSlotProps(state.avatar, {
      accessible: false,
      style: avatarStyle,
    });
  }

  if (state.trailing) {
    attachSlotProps(state.trailing, {
      accessible: false,
      style: trailingStyle,
    });
  }

  if (state.selectionIndicator) {
    attachSlotProps(state.selectionIndicator, {
      ...hiddenFromAccessibilityProps,
      style: selectionIndicatorStyle,
    });
  }
  attachSlotProps(state.root, { style: rootStyle });
}
