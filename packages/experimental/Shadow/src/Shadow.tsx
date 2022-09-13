import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, shadowName } from './Shadow.types';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { getShadowTokenStyleSet } from './shadowStyle';
import { memoize } from '@fluentui-react-native/framework';

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

    const { style: childStyle = {}, ...restOfChildProps } = child.props;

    const shadowViewStyleProps = getStylePropsForShadowViews(childStyle, shadowTokenStyleSet);
    const innerShadowViewProps = mergeProps(restOfChildProps, shadowViewStyleProps.inner);
    const outerShadowViewProps = mergeProps(final, shadowViewStyleProps.outer);

    const childWithInnerShadow = React.cloneElement(child, innerShadowViewProps);

    return <View {...outerShadowViewProps}>{childWithInnerShadow}</View>;
  };
});

const getStylePropsForShadowViews = memoize(getStylePropsForShadowViewsWorker);
function getStylePropsForShadowViewsWorker(childStyleProps: any, shadowTokenStyleSet: any) {
  const {
    borderBottomWidth,
    borderEndWidth,
    borderLeftWidth,
    borderRightWidth,
    borderStartWidth,
    borderTopWidth,
    borderWidth,

    margin,
    marginBottom,
    marginEnd,
    marginHorizontal,
    marginLeft,
    marginRight,
    marginStart,
    marginTop,
    marginVertical,

    padding,
    paddingBottom,
    paddingEnd,
    paddingHorizontal,
    paddingLeft,
    paddingRight,
    paddingStart,
    paddingTop,
    paddingVertical,

    ...restOfChildStyleProps
  } = childStyleProps;

  return {
    inner: {
      style: {
        backgroundColor: 'red', // will not be shown, just needed in macOS/iOS to ensure buggy behaviour is suppressed
        ...(padding && { padding }),
        ...(paddingBottom && { paddingBottom }),
        ...(paddingEnd && { paddingEnd }),
        ...(paddingHorizontal && { paddingHorizontal }),
        ...(paddingLeft && { paddingLeft }),
        ...(paddingRight && { paddingRight }),
        ...(paddingStart && { paddingStart }),
        ...(paddingTop && { paddingTop }),
        ...(paddingVertical && { paddingVertical }),
        ...(borderBottomWidth && { borderBottomWidth }),
        ...(borderEndWidth && { borderEndWidth }),
        ...(borderLeftWidth && { borderLeftWidth }),
        ...(borderRightWidth && { borderRightWidth }),
        ...(borderStartWidth && { borderStartWidth }),
        ...(borderTopWidth && { borderTopWidth }),
        ...(borderWidth && { borderWidth }),
        ...shadowTokenStyleSet.key,
        ...restOfChildStyleProps,
      },
    },
    outer: {
      style: {
        backgroundColor: 'red', // will not be shown, just needed in macOS/iOS to ensure buggy behaviour is suppressed
        ...(margin && { margin }),
        ...(marginBottom && { marginBottom }),
        ...(marginEnd && { marginEnd }),
        ...(marginHorizontal && { marginHorizontal }),
        ...(marginLeft && { marginLeft }),
        ...(marginRight && { marginRight }),
        ...(marginStart && { marginStart }),
        ...(marginTop && { marginTop }),
        ...(marginVertical && { marginVertical }),
        ...shadowTokenStyleSet.ambient,
        ...restOfChildStyleProps,
      },
    },
  };
}

Shadow.displayName = shadowName;

export default Shadow;
