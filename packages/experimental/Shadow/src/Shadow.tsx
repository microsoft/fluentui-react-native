import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, ShadowTokens, shadowName } from './Shadow.types';
import { compressible, buildUseTokens, useFluentTheme, UseTokens } from '@fluentui-react-native/framework';
import { shadowStyleFromTheme } from './shadowStyle';

const useShadowTokens = buildUseTokens<ShadowTokens>(() => ({}), shadowName);

export const Shadow = compressible<ShadowProps, ShadowTokens>((props: ShadowProps) => {
  //const { depth, ...rest } = props;
  //const { depth } = props;
  const theme = useFluentTheme();
  //const [tokens, cache] = useTokens(theme);

  // // override tokens from props? leave undefined for tokens set by the user
  //[tokens, cache] = patchTokens(tokens, cache, {});

  // // build style from tokens that can be shared between different Component instances
  // const [tokenStyle] = cache(
  // 	() => ({
  // 	}),
  // 	[]
  // };

  // // return a continuation function that allows this component to be compressed
  // return (extra/final: ComponentProps, children: React.ReactNode) => {
  // 	const mergedProps = {...};
  // 	return null;
  // }, useShadowTokens);

  const shadowStyle = shadowStyleFromTheme(theme, 'shadow' + props.depth.toString());

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
