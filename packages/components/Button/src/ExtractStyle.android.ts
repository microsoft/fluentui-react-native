import { memoize } from '@fluentui-react-native/framework';
import { ViewStyle } from 'react-native';

// This function is used to seperate out inner and outer styles for the RippleContainer
export const extractOuterStylePropsAndroid = memoize((style: ViewStyle = {}): [outerStyleProps: ViewStyle, innerStyleProps: ViewStyle] => {
  const {
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginStart,
    marginEnd,
    marginVertical,
    marginHorizontal,
    start,
    end,
    left,
    right,
    top,
    bottom,
    display,
    opacity,
    ...restOfProps
  } = style;

  return [
    {
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      marginStart,
      marginEnd,
      marginVertical,
      marginHorizontal,
      start,
      end,
      left,
      right,
      top,
      bottom,
      display,
      opacity,
    },
    { ...restOfProps },
  ];
});
