import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SwitchTokens } from './Switch.types';

export const defaultSwitchTokens: TokenSettings<SwitchTokens, Theme> = (t: Theme) => ({
  borderRadius: 100,
  thumbSize: 26,
  thumbRadius: 100,
  trackHeight: 32,
  trackWidth: 52,
  thumbMargin: 3,
  variant: 'body1',
  color: t.colors.neutralForeground1,

  beforeContent: {
    trackMarginLeft: 16,
  },

  afterContent: {
    trackMarginRight: 8,
  },

  before: {
    flexDirection: 'row',
    toggleContainerFlexDirection: 'row',
  },

  after: {
    flexDirection: 'row-reverse',
    toggleContainerFlexDirection: 'row-reverse',
  },

  toggleOn: {
    trackColor: t.colors.brandBackground,
    thumbColor: t.colors.neutralBackgroundLightStatic,
    pressed: {
      thumbSize: 24,
      thumbMargin: 4,
    },
    disabled: {
      color: t.colors.neutralBackgroundDisabled,
      trackColor: t.colors.brandBackgroundDisabled,
      thumbColor: t.colors.neutralBackgroundLightStaticDisabled,
    },
  },
  toggleOff: {
    trackColor: t.colors.neutralBackground5,
    thumbColor: t.colors.neutralBackgroundLightStatic,
    pressed: {
      thumbSize: 24,
      thumbMargin: 4,
    },
    disabled: {
      color: t.colors.neutralBackgroundDisabled,
      trackColor: t.colors.neutralBackground5,
      thumbColor: t.colors.neutralBackgroundLightStaticDisabled,
    },
  },
  focused: {
    focusStrokeColor: t.colors.strokeFocus2,
  },
});
