import { memoize } from '@fluentui-react-native/framework';
import { ViewStyle } from 'react-native';

/**
 * React Native's Pressable needs to be wrapped with a root view to support curved edges.
 * This function seperates out inner and outer styles for the Container.
 */

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
