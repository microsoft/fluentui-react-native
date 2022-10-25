import * as React from 'react';
import { Platform, Pressable, View, ViewStyle } from 'react-native';
import { rippleName } from './Ripple.types';
import { memoize, stagedComponent } from '@fluentui-react-native/framework';
import { IViewProps } from '@fluentui-react-native/adapters';

export const Ripple = stagedComponent(() => {
  return (_final: IViewProps, children: React.ReactNode) => {
    if (Platform.OS != 'android') {
      return <>{children}</>;
    }
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];
    const child = childrenArray[0];

    if (__DEV__) {
      if (childrenArray.length !== 1) {
        console.warn('Ripple must only have one child');
      }
      if (child.type !== Pressable) {
        console.warn('Should be used to fix curved corners for Pressable only');
      }
    }

    const { style: childStyle, ...restOfChildProps } = child.props;
    const [rippleStyleProps, innerStyleProps] = extractOuterStylePropsAndroid(childStyle);

    restOfChildProps.style = innerStyleProps;
    const childWithOuterRipple = React.cloneElement(child, restOfChildProps);

    return (
      <View style={rippleStyleProps}>
        {/* RN Pressable needs to be wrapped with a root view to support curved edges */}
        {childWithOuterRipple}
      </View>
    );
  };
});

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
    borderRadius,
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
      flexDirection: 'row',
      alignSelf: 'baseline',
      borderRadius,
      overflow: 'hidden',
    },
    { ...restOfProps },
  ];
});

Ripple.displayName = rippleName;

export default Ripple;
