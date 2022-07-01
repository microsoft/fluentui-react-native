import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, ShadowTokens, shadowName } from './Shadow.types';
import { compressible, buildUseTokens, useFluentTheme, mergeProps } from '@fluentui-react-native/framework';
import { shadowStyleFromTheme } from './shadowStyle';

const useShadowTokens = buildUseTokens<ShadowTokens>(() => ({}), shadowName);

export const Shadow = compressible<ShadowProps, ShadowTokens>((props: ShadowProps) => {
  const { depth } = props;
  const theme = useFluentTheme();

  const shadowStyle = shadowStyleFromTheme(theme, depth);

  return (extra: ShadowProps, children: React.ReactNode) => {
    const mergedProps = mergeProps({ style: shadowStyle.key }, extra);

    return (
      <View style={shadowStyle.ambient}>
        <View {...mergedProps}>{children}</View>
      </View>
    );
  };
}, useShadowTokens);
Shadow.displayName = shadowName;

export default Shadow;
