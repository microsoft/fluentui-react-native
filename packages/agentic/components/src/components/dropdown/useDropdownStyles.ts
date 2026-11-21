import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';

import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { getPopoverChrome, getPopoverSurfaceStyle } from '../popover/popover.styles';
import { dropdownStyles, getDropdownChevron } from './dropdown.styles';
import type { DropdownState } from './dropdown.types';

export function useDropdownStyles_unstable(state: DropdownState) {
  const { resolved } = state;
  applyFocusRingStyles(state.FocusRing, state, resolved.root.borderRadius);
  attachSlotProps(state.root, {
    accessible: false,
    style: [dropdownStyles.root, state.userStyle],
  });
  attachSlotProps(state.trigger, {
    style: [resolved.root, resolved.contents, dropdownStyles.trigger],
  });
  if (state.iconStart) {
    attachSlotDefaults(state.iconStart, resolved.icon);
    attachSlotProps(state.iconStart, hiddenFromAccessibilityProps);
  }
  const { source, ...chevron } = getDropdownChevron(state);
  attachSlotProps(state.chevron, {
    ...hiddenFromAccessibilityProps,
    ...chevron,
    ...source,
  });
  attachSlotProps(state.value, {
    accessible: false,
    style: [resolved.textInput, state.showsPlaceholder && { color: resolved.placeholderTextColor }],
  });
  if (state.underline) {
    attachSlotProps(state.underline, { accessible: false, pointerEvents: 'none', style: resolved.underline });
  }
  if (state.underlineFocus) {
    attachSlotProps(state.underlineFocus, { accessible: false, pointerEvents: 'none', style: resolved.underlineFocus });
  }
  const { surface, gap } = getPopoverChrome(state);
  state.popupProps.surfaceStyle = getPopoverSurfaceStyle(surface);
  state.popupProps.gap = gap;
}
