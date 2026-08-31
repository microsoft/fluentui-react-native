import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';

import {
  getListboxItemAvatarSize,
  getListboxItemCheckmarkSize,
  getListboxItemHeaderStyle,
  getListboxItemIconSize,
  getListboxItemLabelColorStyle,
  getListboxItemLabelTypographyStyle,
  getListboxItemRootStyle,
  getListboxItemSecondaryColorStyle,
  getListboxItemSecondaryTypographyStyle,
  listboxItemStyles,
} from './listbox-item.styles';
import type { ListboxItemState } from './listbox-item.types';

export function useListboxItemStyles_unstable(state: ListboxItemState) {
  const resolvedRootStyle = getListboxItemRootStyle(state);
  const rootStyle: StyleProp<ViewStyle> = [listboxItemStyles.root, resolvedRootStyle, state.userStyle];
  state.focusVisualProps = createFocusVisualProps_unstable({
    borderRadius: resolvedRootStyle.borderRadius,
    innerColor: state.tokens.color.strokeFocusInner,
    innerWidth: state.tokens.strokeWidth.thin,
    outerColor: state.tokens.color.strokeFocusOuter,
    outerWidth: state.tokens.strokeWidth.thick,
    visible: state.variant === 'listItem' && state.focused && !state.disabled,
  });
  attachSlotProps(state.root, { style: rootStyle });

  const headerStyle: StyleProp<ViewStyle> = [listboxItemStyles.root, getListboxItemHeaderStyle(state), state.userStyle];
  attachSlotProps(state.header, { style: headerStyle });

  if (state.content) {
    const contentStyle: StyleProp<TextStyle> = [getListboxItemLabelTypographyStyle(state), getListboxItemLabelColorStyle(state)];
    attachSlotProps(state.content, { style: contentStyle });
  }

  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      style: [
        {
          fontFamily: state.tokens.fontFamily.functional,
          fontSize: state.tokens.fontSize.functionalBodyMedium,
          fontWeight: state.tokens.fontWeight.functionalSemibold,
          lineHeight: state.tokens.lineHeight.functionalBodyMedium,
        },
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

  if (state.chevronIndicator) {
    attachSlotProps(state.chevronIndicator, {
      accessible: false,
      color: state.tokens.color.foregroundNeutralPrimary,
      height: getListboxItemIconSize(),
      width: getListboxItemIconSize(),
    });
  }

  if (state.checkmarkIndicator) {
    attachSlotProps(state.checkmarkIndicator, {
      accessible: false,
      color: state.tokens.color.foregroundNeutralPrimary,
      height: getListboxItemCheckmarkSize(),
      width: getListboxItemCheckmarkSize(),
    });
  }

  if (state.checkboxIndicator) {
    attachSlotProps(state.checkboxIndicator, {
      iconColor: state.tokens.color.foregroundNeutralOnloud,
      iconSize: 12,
      status: state.selected ? 'checked' : 'unchecked',
      style: [
        listboxItemStyles.checkboxBox,
        {
          backgroundColor: state.selected ? state.tokens.color.backgroundBrandHeavy : state.tokens.color.backgroundNeutralTransparent,
          borderColor: state.selected ? state.tokens.color.backgroundBrandHeavy : state.tokens.color.foregroundNeutralSecondary,
          height: getListboxItemCheckmarkSize(),
          width: getListboxItemCheckmarkSize(),
        },
      ],
    });
  }
}
