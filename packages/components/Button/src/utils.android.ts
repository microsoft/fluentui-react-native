import { memoize } from '@fluentui-react-native/framework';
import { ViewStyle } from '@office-iss/react-native-win32';

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
