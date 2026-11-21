import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { accordionStyles, getAccordionChevronRotationStyle, getAccordionChrome } from './accordion.styles';
import type { AccordionState } from './accordion.types';

/**
 * Applies cached token styles and slot-level props to the Accordion state.
 */
export function useAccordionStyles_unstable(state: AccordionState) {
  const chrome = getAccordionChrome(state);
  applyFocusRingStyles(state.FocusRing, state, chrome.header.borderRadius);
  attachSlotProps(state.root, { style: [accordionStyles.root, state.userStyle] });
  attachSlotProps(state.header, { style: [accordionStyles.header, chrome.header] });
  if (state.title) {
    attachSlotDefaults(state.title, { style: [accordionStyles.title, chrome.title] });
  }
  if (state.leadingIcon) {
    attachSlotDefaults(state.leadingIcon, { ...chrome.icon, color: chrome.icon.color ?? chrome.title.color });
    attachSlotProps(state.leadingIcon, hiddenFromAccessibilityProps);
  }
  if (state.bodyContent) {
    attachSlotDefaults(state.bodyContent, { style: accordionStyles.bodyContent });
  }
  attachSlotProps(state.body, {
    style: [accordionStyles.body, chrome.body, state.expanded ? accordionStyles.expandedBody : accordionStyles.collapsedBody],
  });
  attachSlotProps(state.chevronContainer, {
    style: [accordionStyles.chevronContainer, chrome.chevronContainer, getAccordionChevronRotationStyle(state)],
  });
  attachSlotProps(state.chevron, {
    ...hiddenFromAccessibilityProps,
    ...chrome.icon,
    color: chrome.icon.color ?? chrome.title.color,
  });

  return { bodyPlaceholderStyle: [accordionStyles.bodyPlaceholder, chrome.bodyPlaceholder] };
}
