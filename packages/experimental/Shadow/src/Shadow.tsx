import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, ShadowTokens, shadowName } from './Shadow.types';
import { compressible, buildUseTokens, useFluentTheme } from '@fluentui-react-native/framework';
import { shadowStyleFromTheme } from './shadowStyle';

const useShadowTokens = buildUseTokens<ShadowTokens>(() => ({}), shadowName);

export const Shadow = compressible<ShadowProps, ShadowTokens>((props: ShadowProps) => {
  const { depth } = props;
  const theme = useFluentTheme();

  const shadowStyle = shadowStyleFromTheme(theme, 'shadow' + depth.toString());

  return (extra: ShadowProps, children: React.ReactNode) => {
    return (
      <View style={shadowStyle.ambient}>
        <View style={shadowStyle.key}>{children}</View>
      </View>
    );
  };
}, useShadowTokens);
Shadow.displayName = shadowName;

export default Shadow;
