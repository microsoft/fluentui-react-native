import * as React from 'react';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';

import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { memoize } from '@fluentui-react-native/framework';
import type { ShadowToken } from '@fluentui-react-native/theme-types';

import type { ShadowProps } from './Shadow.types';
import { shadowName } from './Shadow.types';
import { getShadowTokenStyleSet } from './shadowStyle';

export const Shadow = stagedComponent((props: ShadowProps) => {
  return (final: ShadowProps, children: React.ReactNode) => {
    if (!props.shadowToken) {
      return <>{children}</>;
    }

    const childrenArray = React.Children.toArray(children) as React.ReactElement[];
    const child = childrenArray[0];

    if (__DEV__) {
      if (childrenArray.length !== 1) {
        console.warn('Shadow must only have one child');
      }
    }

    const { style: childStyle, ...restOfChildProps } = child.props as { style?: ViewStyle; [key: string]: any };

    const shadowViewStyleProps = getStylePropsForShadowViews(childStyle, props.shadowToken);
    const innerShadowViewProps = mergeProps(restOfChildProps, shadowViewStyleProps.inner);
    const outerShadowViewProps = mergeProps(final, shadowViewStyleProps.outer);

    const childWithInnerShadow = React.cloneElement(child, innerShadowViewProps);

    return <View {...outerShadowViewProps}>{childWithInnerShadow}</View>;
  };
});

const getStylePropsForShadowViews = memoize(getStylePropsForShadowViewsWorker);
function getStylePropsForShadowViewsWorker(childStyleProps: ViewStyle = {}, shadowToken: ShadowToken) {
  const shadowTokenStyleSet = getShadowTokenStyleSet(shadowToken);

  if (__DEV__) {
    if (!childStyleProps.backgroundColor) {
      console.warn('The View that the Shadow is set on must have a background color set');
    }
  }

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

    alignItems,

    flexWrap,
    flexDirection,

    start,
    end,
    left,
    right,
    top,
    bottom,

    ...restOfChildStyleProps
  } = childStyleProps;

  // Remove undefined properties, otherwise every prop will be added and be set to
  // undefined, which can cause unexpected behaviour with some of the styles
  const innerStyle = removeUndefinedProperties({
    borderBottomWidth,
    borderEndWidth,
    borderLeftWidth,
    borderRightWidth,
    borderStartWidth,
    borderTopWidth,
    borderWidth,

    padding,
    paddingBottom,
    paddingEnd,
    paddingHorizontal,
    paddingLeft,
    paddingRight,
    paddingStart,
    paddingTop,
    paddingVertical,

    alignItems,

    flexWrap,
    flexDirection,

    ...shadowTokenStyleSet.key,
    ...restOfChildStyleProps,
  });

  const outerStyle = removeUndefinedProperties({
    margin,
    marginBottom,
    marginEnd,
    marginHorizontal,
    marginLeft,
    marginRight,
    marginStart,
    marginTop,
    marginVertical,

    start,
    end,
    left,
    right,
    top,
    bottom,

    ...shadowTokenStyleSet.ambient,
    ...restOfChildStyleProps,
  });

  return { inner: { style: innerStyle }, outer: { style: outerStyle } };
}

function withObjectAssign(object, [key, value]) {
  if (value !== undefined) {
    return Object.assign(object, { [key]: value });
  }

  return object;
}

const removeUndefinedProperties = (object: ViewStyle) => {
  return Object.entries(object).reduce(withObjectAssign, {});
};

Shadow.displayName = shadowName;

export default Shadow;
