import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, shadowName } from './Shadow.types';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { getShadowTokenStyleSet } from './shadowStyle';

// Original component
// export const Shadow = stagedComponent((props: ShadowProps) => {
//   return (final: ShadowProps, children: React.ReactNode) => {
//     if (!props.shadowToken) {
//       return <>{children}</>;
//     }

//     const shadowTokenStyleSet = getShadowTokenStyleSet(props.shadowToken);
//     const mergedProps = mergeProps(final, { style: shadowTokenStyleSet.ambient });

//     const childrenArray = React.Children.toArray(children) as React.ReactElement[];
//     const child = childrenArray[0];

//     if (__DEV__) {
//       if (childrenArray.length !== 1) {
//         console.warn('Shadow must only have one child');
//       }
//     }

//     const childWithKeyShadow = React.cloneElement(child, mergeProps(child.props, { style: shadowTokenStyleSet.key }));

//     return <View {...mergedProps}>{childWithKeyShadow}</View>;
//   };
// });

// Approach 1: Pulling out margin/padding
export const Shadow = stagedComponent((props: ShadowProps) => {
  return (final: ShadowProps, children: React.ReactNode) => {
    if (!props.shadowToken) {
      return <>{children}</>;
    }

    const shadowTokenStyleSet = getShadowTokenStyleSet(props.shadowToken);
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];
    const child = childrenArray[0];

    if (__DEV__) {
      if (childrenArray.length !== 1) {
        console.warn('Shadow must only have one child');
      }
    }

    const { style, ...restOfChildProps } = child.props;
    const { marginHorizontal, marginVertical, padding, ...restOfChildStyleProps } = style; // for now, just the props for the shadow box

    const innerShadowProps = mergeProps(restOfChildProps, {
      style: [
        shadowTokenStyleSet.key,
        {
          backgroundColor: 'red', // will not be shown, just something needed to be set in macOS/iOS to suppress buggy behaviour
          padding: padding,
        },
        restOfChildStyleProps,
      ],
    });
    const outerShadowProps = mergeProps(final, {
      style: [
        shadowTokenStyleSet.ambient,
        {
          backgroundColor: 'red', // will not be shown, just something needed to be set in macOS/iOS to suppress buggy behaviour
          marginHorizontal: marginHorizontal,
          marginVertical: marginVertical,
        },
        restOfChildStyleProps,
      ],
    });

    const childWithKeyShadow = React.cloneElement(child, innerShadowProps);

    return <View {...outerShadowProps}>{childWithKeyShadow}</View>;
  };
});

Shadow.displayName = shadowName;

export default Shadow;
