import { I18nManager } from 'react-native';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import type { ProgressBarState } from './progress-bar.types';

export function useProgressBarStyles_unstable(state: ProgressBarState) {
  const { styles, trackLayoutWidth } = state;
  const animateDeterminate = state.type === 'determinate' && !state.isReduceMotionEnabled;
  const direction = I18nManager.isRTL ? -1 : 1;
  const transform = animateDeterminate
    ? [
        // Compensate for center-origin scaling to pin the fill at the logical start.
        { translateX: state.indicatorScaleX.interpolate({ inputRange: [0, 1], outputRange: [(-direction * trackLayoutWidth) / 2, 0] }) },
        { scaleX: state.indicatorScaleX },
      ]
    : state.type === 'indeterminate' && !state.isReduceMotionEnabled
      ? [{ translateX: state.indicatorTranslateX }]
      : undefined;

  attachSlotProps(state.root, { style: [styles.root, state.rootStyle] });
  attachSlotProps(state.track, { style: styles.track, testID: 'progress-bar-track' });
  attachSlotProps(state.indicator, {
    style: [styles.indicator, { width: animateDeterminate ? trackLayoutWidth : state.indicatorWidth, transform }],
    testID: 'progress-bar-indicator',
  });
  if (state.validationIcon) {
    attachSlotDefaults(state.validationIcon, styles.validationIcon);
    attachSlotProps(state.validationIcon, { accessible: false });
  }
}
