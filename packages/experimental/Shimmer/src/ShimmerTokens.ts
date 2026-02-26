import type { Theme } from '@fluentui-react-native/framework';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import { shimmerDefaultAngle, shimmerDefaultDelay, shimmerDefaultDuration } from './consts';
import type { ShimmerTokens } from './Shimmer.types';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens, Theme> = (theme: Theme) =>
  ({
    angle: shimmerDefaultAngle,
    backgroundColor: theme.colors.transparentBackground,
    delay: shimmerDefaultDelay,
    duration: shimmerDefaultDuration,
    shimmerColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? '#E1E1E1' : '#404040',
    shimmerColorOpacity: 1,
    shimmerWaveColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? 'white' : 'black',
    shimmerWaveColorOpacity: 1,
  }) as ShimmerTokens;
