import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import type { ProgressBarState } from './progress-bar.types';

/**
 * Applies stable theme styles and state-specific layout to the progress bar slots.
 */
export function useApplyStyles_unstable(state: ProgressBarState) {
  const styles = state.styles;
  const trackStyle: StyleProp<ViewStyle> = [styles.track];
  const indicatorStyle: StyleProp<ViewStyle> = [
    styles.indicator,
    {
      backgroundColor: state.indicatorColor,
      width: state.indicatorWidth,
    },
    state.type === 'indeterminate' && !state.isReduceMotionEnabled
      ? {
          transform: [{ translateX: state.indicatorTranslateX }],
        }
      : undefined,
    state.type !== 'indeterminate'
      ? {
          ...( {
            transitionDuration: state.indicatorTransitionDuration,
            transitionTimingFunction: 'ease-out',
            transitionProperty: 'width',
          } as any),
        }
      : undefined,
  ];

  attachSlotProps(state.root, { style: [styles.root, state.rootStyle] });
  attachSlotProps(state.track, {
    style: trackStyle,
    testID: 'progress-bar-track',
  });
  attachSlotProps(state.indicator, {
    style: indicatorStyle,
    testID: 'progress-bar-indicator',
  });

  if (state.validationIcon) {
    attachSlotProps(state.validationIcon, {
      accessible: false,
      color: state.validationIconColor,
      height: styles.validationIcon.height,
      width: styles.validationIcon.width,
    });
  }
}
