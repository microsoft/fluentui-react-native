import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { getMenuGap } from '../menu/menu.styles';
import { dropdownStyles, getDropdownThemeStyles } from './dropdown.styles';
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
    attachSlotProps(state.iconStart, {
      accessible: false,
      color: resolved.iconColor,
      height: resolved.iconSize,
      width: resolved.iconSize,
    });
  }
  attachSlotProps(state.chevron, {
    accessible: false,
    color: state.chevronColor,
    height: resolved.iconSize,
    width: resolved.iconSize,
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
  state.popupProps.surfaceStyle = getDropdownThemeStyles(state).surface;
  state.popupProps.gap = getMenuGap(state.tokens);
}
