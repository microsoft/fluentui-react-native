import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';


export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    {
      toValue: 30,
      duration: 7000,
      delay: 0,
      gradientTintColor: 'white',
      shimmerTintColor:"#E1E1E1",
    },
    shimmerName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens, _theme: Theme) => ({
        style: {
          viewbox: '0 0 100 100',
          width:200,
          height:300,
          gradientTintColor:tokens.gradientTintColor,
          toValue:tokens.toValue,
          duration: tokens.duration,
          delay: tokens.delay,
          shimmerTintColor:tokens.shimmerTintColor,
        },
      }),
    ),
  },

};
