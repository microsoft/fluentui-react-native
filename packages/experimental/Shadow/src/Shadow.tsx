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

  const [keyShadowTokenStyle] = cache(() => {
    const keyShadowStyle = shadowStyleFromTheme(theme, depth).key;
    return {
      shadowColor: keyShadowStyle.shadowColor,
      shadowOpacity: keyShadowStyle.shadowOpacity,
      shadowRadius: keyShadowStyle.shadowRadius,
      shadowOffset: keyShadowStyle.shadowOffset,
    };
  }, ['shadowColor', 'shadowOpacity', 'shadowRadius', 'shadowOffset']);

  const [ambientShadowTokenStyle] = cache(() => {
    const ambientShadowStyle = shadowStyleFromTheme(theme, depth).ambient;
    return {
      shadowColor: ambientShadowStyle.shadowColor,
      shadowOpacity: ambientShadowStyle.shadowOpacity,
      shadowRadius: ambientShadowStyle.shadowRadius,
      shadowOffset: ambientShadowStyle.shadowOffset,
    };
  }, ['shadowColor', 'shadowOpacity', 'shadowRadius', 'shadowOffset']);

  return (extra: ShadowProps, children: React.ReactNode) => {
    const mergedProps = mergeProps(tokens, { style: keyShadowTokenStyle }, extra);

    return (
      <View style={ambientShadowTokenStyle}>
        <View {...mergedProps}>{children}</View>
      </View>
    );
  };
}, useShadowTokens);
Shadow.displayName = shadowName;

export default Shadow;
