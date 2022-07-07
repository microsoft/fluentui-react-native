import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, shadowName, ShadowDepth } from './Shadow.types';
import { useFluentTheme, memoize, mergeProps, stagedComponent, Theme } from '@fluentui-react-native/framework';
import { shadowStyleFromTheme } from './shadowStyle';

export const Shadow = stagedComponent((props: ShadowProps) => {
  const theme = useFluentTheme();

  return (final: ShadowProps, ...children: React.ReactNode[]) => {
    const shadowTokenStyleSet = getShadowTokenStyleSet(theme, props.depth);
    const mergedProps = mergeProps(final, { style: shadowTokenStyleSet.key });

    return (
      <View style={shadowTokenStyleSet.ambient}>
        <View {...mergedProps}>{children}</View>
      </View>
    );
  };
});

Shadow.displayName = shadowName;

const getShadowTokenStyleSet = memoize(getShadowTokenStyleSetWorker);
function getShadowTokenStyleSetWorker(theme: Theme, depth: ShadowDepth) {
  return shadowStyleFromTheme(theme, depth);
}

export default Shadow;
