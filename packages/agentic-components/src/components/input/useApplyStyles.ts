import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { inputStyles } from './input.styles';
import type { InputState } from './input.types';

export function useApplyStyles_unstable(state: InputState) {
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
  if (state.iconStart) {
    attachSlotProps(state.iconStart, {
      accessible: false,
      color: state.iconColor,
      height: state.iconSize,
      width: state.iconSize,
    });
  }
  if (state.iconEnd1) {
    attachSlotProps(state.iconEnd1, {
      accessible: false,
      color: state.iconColor,
      height: state.iconSize,
      width: state.iconSize,
    });
  }
  if (state.iconEnd2) {
    attachSlotProps(state.iconEnd2, {
      accessible: false,
      color: state.iconColor,
      height: state.iconSize,
      width: state.iconSize,
    });
  }
}
