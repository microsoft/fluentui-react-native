import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import { shimmerDefaultAngle, shimmerDefaultDelay, shimmerDefaultDuration } from './consts';
import type { ShimmerTokens } from './Shimmer.types';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens, Theme> = (theme: Theme) =>
  ({
    angle: shimmerDefaultAngle,
    backgroundColor: theme.colors.background,
    delay: shimmerDefaultDelay,
    duration: shimmerDefaultDuration,
    shimmerColor: theme.colors.bodyFrameDivider,
    shimmerColorOpacity: 1,
    shimmerWaveColor: '#E1E1E1',
    shimmerWaveColorOpacity: 1,
    shimmerWaveWidth: '100%',
  }) as ShimmerTokens;
