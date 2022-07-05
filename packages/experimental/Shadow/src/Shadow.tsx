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
  const shadowStyle = shadowStyleFromTheme(theme, depth);

  const [keyShadowTokenStyle] = cache(
    () => ({
      shadowColor: shadowStyle.key.shadowColor,
      shadowOpacity: shadowStyle.key.shadowOpacity,
      shadowRadius: shadowStyle.key.shadowRadius,
      shadowOffset: shadowStyle.key.shadowOffset,
    }),
    ['shadowColor', 'shadowOpacity', 'shadowRadius', 'shadowOffset'],
  );

  const [ambientShadowTokenStyle] = cache(
    () => ({
      shadowColor: shadowStyle.ambient.shadowColor,
      shadowOpacity: shadowStyle.ambient.shadowOpacity,
      shadowRadius: shadowStyle.ambient.shadowRadius,
      shadowOffset: shadowStyle.ambient.shadowOffset,
    }),
    ['shadowColor', 'shadowOpacity', 'shadowRadius', 'shadowOffset'],
  );

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
