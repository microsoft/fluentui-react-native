import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ShimmerTokens } from './Shimmer.types';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens, Theme> = (theme: Theme) =>
  ({
    angle: 0,
    backgroundColor: theme.colors.background,
    delay: 500,
    duration: 2000,
    shimmerColor: theme.colors.bodyFrameDivider,
    shimmerColorOpacity: 1,
    shimmerWaveColor: '#E1E1E1',
    shimmerWaveColorOpacity: 1,
    shimmerWaveWidth: '100%',
  } as ShimmerTokens);
