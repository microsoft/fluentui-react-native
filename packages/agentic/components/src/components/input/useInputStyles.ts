import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { inputStyles } from './input.styles';
import type { InputState } from './input.types';

export function useInputStyles_unstable(state: InputState) {
  applyFocusRingStyles(state.FocusRing, state, state.rootStyle.borderRadius);
  const rootStyle: StyleProp<ViewStyle> = [inputStyles.root, state.rootStyle, state.userStyle];
  const contentsStyle: StyleProp<ViewStyle> = [inputStyles.contents, state.contentsStyle];
  const iconTextStackStyle: StyleProp<ViewStyle> = [inputStyles.iconTextStack, state.iconTextStackStyle];
  const iconEndStyle: StyleProp<ViewStyle> = [inputStyles.iconEnd, state.iconEndStyle];
  const underlineStyle: StyleProp<ViewStyle> = [inputStyles.underline, state.underlineStyle];
  attachSlotProps(state.root, {
    accessibilityElementsHidden: false,
    accessible: false,
    style: rootStyle,
    testID: 'input-root',
  });
  attachSlotProps(state.contents, {
    accessibilityElementsHidden: false,
    accessible: false,
    style: contentsStyle,
    testID: 'input-contents',
  });
  attachSlotProps(state.iconTextStack, {
    accessibilityElementsHidden: false,
    accessible: false,
    style: iconTextStackStyle,
    testID: 'input-icon-text-stack',
  });
  if (state.iconEnd) {
    attachSlotProps(state.iconEnd, {
      accessibilityElementsHidden: false,
      accessible: false,
      style: iconEndStyle,
      testID: 'input-icon-end',
    });
  }
  if (state.underline) {
    attachSlotProps(state.underline, {
      accessibilityElementsHidden: false,
      accessible: false,
      style: underlineStyle,
      testID: 'input-underline',
    });
  }
  if (state.underlineFocus) {
    attachSlotProps(state.underlineFocus, {
      accessible: false,
      focusable: false,
      pointerEvents: 'none',
      style: state.underlineFocusStyle,
      testID: 'input-underline-focus',
    });
  }
  for (const icon of [state.iconStart, state.iconEnd1, state.iconEnd2]) {
    if (icon) {
      attachSlotDefaults(icon, state.iconDefaults);
      attachSlotProps(icon, { accessible: false });
    }
  }
}
