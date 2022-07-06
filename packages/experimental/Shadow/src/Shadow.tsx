import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, ShadowTokens, shadowName } from './Shadow.types';
import { compressible, buildUseTokens, useFluentTheme, mergeProps, UseTokens } from '@fluentui-react-native/framework';
import { shadowStyleFromTheme } from './shadowStyle';

const useShadowTokens = buildUseTokens<ShadowTokens>(() => ({}), shadowName);

export const Shadow = compressible<ShadowProps, ShadowTokens>((props: ShadowProps, useTokens: UseTokens<ShadowTokens>) => {
  const { depth } = props;
  const theme = useFluentTheme();

  const [tokens, cache] = useTokens(theme);

  const [shadowTokenStyleSet] = cache(() => shadowStyleFromTheme(theme, depth), ['theme', 'depth']);

  return (extra: ShadowProps, children: React.ReactNode) => {
    const mergedProps = mergeProps(tokens, { style: shadowTokenStyleSet.key }, extra);

    return (
      <View style={shadowTokenStyleSet.ambient}>
        <View {...mergedProps}>{children}</View>
      </View>
    );
  };
}, useShadowTokens);
Shadow.displayName = shadowName;

export default Shadow;
