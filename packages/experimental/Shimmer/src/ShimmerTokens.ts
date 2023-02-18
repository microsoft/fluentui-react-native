import type { Theme } from '@fluentui-react-native/framework';
import type { ShimmerTokens } from './Shimmer.types';
import type { TokenSettings } from '@fluentui-react-native/use-styling';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens, Theme> = (theme: Theme) =>
  ({
    angle: 0,
    delay: 0,
    duration: 7000,
    shimmerColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? '#E1E1E1' : '#404040',
    shimmerColorOpacity: 1,
    shimmerWaveColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? 'white' : 'black',
    shimmerWaveColorOpacity: 1,
  } as ShimmerTokens);
