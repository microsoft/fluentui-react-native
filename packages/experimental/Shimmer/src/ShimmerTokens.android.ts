import { Theme } from '@fluentui-react-native/framework';
import { ShimmerTokens } from './Shimmer.types';
import { TokenSettings } from '@fluentui-react-native/use-styling';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens, Theme> = (theme: Theme) =>
  ({
    angle: 45,
    delay: 0,
    duration: 1000,
    shimmerColor: theme.colors.neutralStencil1,
    shimmerColorOpacity: 1,
    shimmerWaveColor: theme.colors.neutralStencil2,
    shimmerWaveColorOpacity: 1,
  } as ShimmerTokens);
