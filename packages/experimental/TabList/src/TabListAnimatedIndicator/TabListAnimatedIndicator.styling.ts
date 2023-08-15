import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type {
  TabListAnimatedIndicatorTokens,
  TabListAnimatedIndicatorSlotProps,
  TabListAnimatedIndicatorProps,
} from './TabListAnimatedIndicator.types';

export const stylingSettings: UseStylingOptions<
  TabListAnimatedIndicatorProps,
  TabListAnimatedIndicatorSlotProps,
  TabListAnimatedIndicatorTokens
> = {
  slotProps: {
    root: buildProps(
      () => ({
        style: {
          position: 'absolute',
          bottom: 0,
          start: 0,
        },
      }),
      [],
    ),
    indicator: buildProps(
      (_, theme: Theme) => ({
        style: {
          backgroundColor: theme.colors.compoundBrandStroke1,
        },
      }),
      [],
    ),
  },
};
