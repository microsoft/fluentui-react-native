import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { getRadioGroupThemeStyles, radioGroupStyles } from './radio-group.styles';
import type { RadioGroupState } from './radio-group.types';

export function useRadioGroupStyles_unstable(state: RadioGroupState) {
  const theme = getRadioGroupThemeStyles(state);
  attachSlotProps(state.root, { style: [radioGroupStyles.root, theme.root, radioGroupStyles[state.direction], state.userStyle] });
  attachSlotProps(state.options, {
    style: [radioGroupStyles.options, theme.options, radioGroupStyles[state.orientation], radioGroupStyles[state.direction]],
  });
}
