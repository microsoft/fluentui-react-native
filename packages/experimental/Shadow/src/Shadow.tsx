import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, shadowName } from './Shadow.types';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { getShadowTokenStyleSet } from './shadowStyle';

export const Shadow = stagedComponent((props: ShadowProps) => {
  return (final: ShadowProps, children: React.ReactNode) => {
    if (!props.shadowToken) {
      return <>{children}</>;
    } else {
      const shadowTokenStyleSet = getShadowTokenStyleSet(props.shadowToken);
      const mergedProps = mergeProps(final, { style: shadowTokenStyleSet.ambient });

      const childrenArray = React.Children.toArray(children) as React.ReactElement[];
      const child = childrenArray[0];

      if (__DEV__) {
        if (childrenArray.length !== 1) {
          console.warn('Shadow must only have one child');
        }
      }

      const childWithKeyShadow = React.cloneElement(child, mergeProps(child.props, { style: shadowTokenStyleSet.key }));

      return <View {...mergedProps}>{childWithKeyShadow}</View>;
    }
  };
});

Shadow.displayName = shadowName;

export default Shadow;
