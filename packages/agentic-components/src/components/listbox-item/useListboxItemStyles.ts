import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  getListboxItemAvatarSize,
  getListboxItemFocusStyle,
  getListboxItemGhostLabelStyle,
  getListboxItemHeaderStyle,
  getListboxItemIconSize,
  getListboxItemLabelColorStyle,
  getListboxItemLabelTypographyStyle,
  getListboxItemRootStyle,
  getListboxItemSecondaryColorStyle,
  getListboxItemSecondaryTypographyStyle,
  getListboxItemVisibleLabelStyle,
  listboxItemStyles,
} from './listbox-item.styles';
import type { ListboxItemState } from './listbox-item.types';

export function useListboxItemStyles_unstable(state: ListboxItemState) {
  const rootStyle: StyleProp<ViewStyle> = [
    listboxItemStyles.root,
    getListboxItemRootStyle(state),
    getListboxItemFocusStyle(state),
    state.userStyle,
  ];
  state.rootProps.style = rootStyle;

  const headerStyle: StyleProp<ViewStyle> = [listboxItemStyles.root, getListboxItemHeaderStyle(state), state.userStyle];
  state.headerProps.style = headerStyle;

  if (state.content) {
    const contentStyle: StyleProp<TextStyle> = [
      getListboxItemLabelTypographyStyle(state),
      getListboxItemLabelColorStyle(state),
      getListboxItemVisibleLabelStyle(state),
    ];
    attachSlotProps(state.content, { style: contentStyle });
  }

  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
      style: [
        {
          fontFamily: state.tokens.fontFamily.functional,
          fontSize: state.tokens.fontSize.functionalBodyMedium,
          fontWeight: state.tokens.fontWeight.functionalSemibold,
          lineHeight: state.tokens.lineHeight.functionalBodyMedium,
        },
        getListboxItemGhostLabelStyle(),
        getListboxItemLabelColorStyle(state),
      ],
    });
  }

  if (state.secondaryContent) {
    attachSlotProps(state.secondaryContent, {
      style: [
        getListboxItemSecondaryTypographyStyle(state),
        getListboxItemSecondaryColorStyle(state),
        state.secondaryContentPosition === 'right' ? { flexShrink: 1, textAlign: 'right' } : { flexShrink: 1 },
      ],
    });
  }

  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: getListboxItemLabelColorStyle(state).color,
      height: getListboxItemIconSize(),
      width: getListboxItemIconSize(),
      ...(state.secondaryContentPosition === 'under' ? { style: { alignSelf: 'flex-start' } } : {}),
    });
  }

  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: getListboxItemLabelColorStyle(state).color,
      height: getListboxItemIconSize(),
      width: getListboxItemIconSize(),
      ...(state.secondaryContentPosition === 'under' ? { style: { alignSelf: 'flex-start' } } : {}),
    });
  }

  if (state.avatar) {
    attachSlotProps(state.avatar, {
      accessible: false,
      style: {
        borderRadius: getListboxItemAvatarSize() / 2,
        height: getListboxItemAvatarSize(),
        overflow: 'hidden',
        width: getListboxItemAvatarSize(),
      },
    });
  }
}
