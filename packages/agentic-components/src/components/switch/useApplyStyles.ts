import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  getSwitchFocusStyle,
  getSwitchLabelStyle,
  getSwitchLayoutStyle,
  getSwitchRootBaseStyle,
  getSwitchThumbBaseStyle,
  getSwitchThumbColorStyle,
  getSwitchThumbTranslateDistance,
  getSwitchTrackBaseStyle,
  getSwitchTrackColorStyle,
  switchStyles,
} from './switch.styles';
import type { SwitchState } from './switch.types';

/**
 * Apply themed styles and state-dependent slot props to the Switch.
 */
export function useApplyStyles_unstable(state: SwitchState) {
  const trackUncheckedColor = getSwitchTrackColorStyle(state, false);
  const trackCheckedColor = getSwitchTrackColorStyle(state, true);
  const thumbUncheckedColor = getSwitchThumbColorStyle(state, false);
  const thumbCheckedColor = getSwitchThumbColorStyle(state, true);
  const thumbTranslateDistance = getSwitchThumbTranslateDistance(state);

  const rootStyle: StyleProp<ViewStyle> = [switchStyles.root, getSwitchRootBaseStyle(state), getSwitchFocusStyle(state), state.userStyle];
  const layoutStyle: StyleProp<ViewStyle> = [switchStyles.container, getSwitchLayoutStyle(state.layout)];
  const trackStyle: StyleProp<ViewStyle> = [
    switchStyles.track,
    getSwitchTrackBaseStyle(state),
    {
      backgroundColor: state.checkedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [trackUncheckedColor.backgroundColor, trackCheckedColor.backgroundColor],
      }),
      borderColor: state.checkedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [trackUncheckedColor.borderColor, trackCheckedColor.borderColor],
      }),
    },
  ];
  const thumbStyle: StyleProp<ViewStyle> = [
    switchStyles.thumb,
    getSwitchThumbBaseStyle(state),
    {
      backgroundColor: state.checkedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [thumbUncheckedColor.backgroundColor, thumbCheckedColor.backgroundColor],
      }),
      transform: [
        {
          translateX: state.checkedProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, thumbTranslateDistance],
          }),
        },
      ],
    },
  ];
  const labelStyle: StyleProp<TextStyle> = [switchStyles.label, getSwitchLabelStyle(state)];

  attachSlotProps(state.layoutContainer, { style: layoutStyle });
  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.track, { accessible: false, style: trackStyle });
  attachSlotProps(state.thumb, { accessible: false, style: thumbStyle });

  if (state.beforeLabel) {
    attachSlotProps(state.beforeLabel, {
      accessible: false,
      style: labelStyle,
    });
  }

  if (state.afterLabel) {
    attachSlotProps(state.afterLabel, {
      accessible: false,
      style: labelStyle,
    });
  }

  if (state.aboveLabel) {
    attachSlotProps(state.aboveLabel, {
      accessible: false,
      style: labelStyle,
    });
  }
}
