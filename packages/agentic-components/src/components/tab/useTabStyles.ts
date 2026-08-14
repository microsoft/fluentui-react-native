import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { tabStyles, getTabColorStyles, getTabContentStyle, getTabFocusStyle, getTabIconSize, getTabRootStyle } from './tab.styles';
import type { TabState } from './tab.types';

/**
 * Applies stable theme styles and instance-specific style selections to the Tab slots.
 */
export function useTabStyles_unstable(state: TabState) {
  const colors = getTabColorStyles(state);
  const rootStyle: StyleProp<ViewStyle> = [
    tabStyles.root,
    getTabRootStyle(state),
    colors.background,
    getTabFocusStyle(state),
    state.userStyle,
  ];
  const contentStyle: StyleProp<TextStyle> = [tabStyles.content, getTabContentStyle(state), colors.foreground];
  const hiddenContentStyle: StyleProp<TextStyle> = [tabStyles.content, getTabContentStyle(state, true), colors.foreground];
  const iconSize = getTabIconSize();

  attachSlotProps(state.root, { style: rootStyle });
  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: colors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: colors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.content) {
    attachSlotProps(state.content, {
      style: contentStyle,
    });
  }
  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      style: hiddenContentStyle,
    });
  }
}
