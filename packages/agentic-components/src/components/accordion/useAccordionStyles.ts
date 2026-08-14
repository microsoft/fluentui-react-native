import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  accordionStyles,
  getAccordionBodyForegroundStyle,
  getAccordionBodyLayoutStyle,
  getAccordionBodyTypographyStyle,
  getAccordionChevronLayoutStyle,
  getAccordionHeaderColorStyles,
  getAccordionHeaderFocusStyle,
  getAccordionHeaderLayoutStyle,
  getAccordionIconSize,
  getAccordionTitleLayoutStyle,
  getAccordionTitleTypographyStyle,
} from './accordion.styles';
import type { AccordionState } from './accordion.types';

/**
 * Applies cached token styles and slot-level props to the Accordion state.
 */
export function useAccordionStyles_unstable(state: AccordionState) {
  const headerColors = getAccordionHeaderColorStyles(state);
  const rootStyle: StyleProp<ViewStyle> = [accordionStyles.root, state.userStyle];
  const headerStyle: StyleProp<ViewStyle> = [
    accordionStyles.header,
    getAccordionHeaderLayoutStyle(state),
    headerColors.background,
    getAccordionHeaderFocusStyle(state),
  ];
  const titleStyle: StyleProp<TextStyle> = [
    accordionStyles.title,
    getAccordionTitleLayoutStyle(state),
    getAccordionTitleTypographyStyle(state),
    headerColors.foreground,
  ];
  const bodyStyle: StyleProp<ViewStyle> = [
    accordionStyles.body,
    getAccordionBodyLayoutStyle(state),
    state.expanded
      ? { opacity: 1, overflow: 'visible' }
      : { height: 0, opacity: 0, overflow: 'hidden', paddingHorizontal: 0, paddingTop: 0 },
  ];
  const bodyContentStyle: StyleProp<ViewStyle> = [accordionStyles.bodyContent];
  const bodyPlaceholderStyle: StyleProp<TextStyle> = [
    accordionStyles.bodyPlaceholder,
    getAccordionBodyTypographyStyle(state),
    getAccordionBodyForegroundStyle(state),
  ];
  const chevronContainerStyle: StyleProp<ViewStyle> = [
    accordionStyles.chevronContainer,
    getAccordionChevronLayoutStyle(state),
    { transform: [{ rotate: state.expanded ? '90deg' : '0deg' }] },
  ];
  const iconSize = getAccordionIconSize();

  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.header, { style: headerStyle });
  if (state.title) {
    attachSlotProps(state.title, { style: titleStyle });
  }
  if (state.leadingIcon) {
    attachSlotProps(state.leadingIcon, {
      accessible: false,
      color: headerColors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.bodyContent) {
    attachSlotProps(state.bodyContent, { style: bodyContentStyle });
  }
  attachSlotProps(state.body, { style: bodyStyle });
  attachSlotProps(state.chevronContainer, { style: chevronContainerStyle });
  attachSlotProps(state.chevron, {
    accessible: false,
    color: headerColors.foreground.color,
    height: iconSize,
    width: iconSize,
  });

  return {
    bodyPlaceholderStyle,
  };
}
