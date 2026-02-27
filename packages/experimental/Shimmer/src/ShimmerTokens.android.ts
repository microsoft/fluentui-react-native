import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import { shimmerDefaultAngle, shimmerDefaultDelay, shimmerDefaultDuration } from './consts';
import type { ShimmerTokens } from './Shimmer.types';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens, Theme> = (theme: Theme) =>
  ({
    angle: shimmerDefaultAngle,
    delay: shimmerDefaultDelay,
    duration: shimmerDefaultDuration,
    shimmerColor: theme.colors.neutralStencil1,
    shimmerColorOpacity: 1,
    shimmerWaveColor: theme.colors.neutralStencil2,
    shimmerWaveColorOpacity: 1,
  }) as ShimmerTokens;
