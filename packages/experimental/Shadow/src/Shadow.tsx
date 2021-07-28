/** @jsx withSlots */
import {
  applyTokenLayers,
  buildUseTokens,
  compressible,
  mergeStyles,
  Theme,
  withSlots,
  useSlot,
  useTheme,
  UseTokens,
  borderStyles,
} from '@fluentui-react-native/framework';
import { ShadowProps, ShadowTokens } from './Shadow.types';
import { View, ViewProps } from 'react-native';
import { applyPropsToTokens } from '@fluentui-react-native/use-tokens';

const useShadowTokens = buildUseTokens<ShadowTokens>((theme: Theme) => {
  return {
    color: 'black',
    backgroundColor: theme.colors.background,
    ambient: theme.effects.shadow4.ambient,
    key: theme.effects.shadow4.key,
    innerShadowSlot: View,
    depth2: {
      ambient: theme.effects.shadow2.ambient,
      key: theme.effects.shadow2.key,
    },
    depth4: {
      ambient: theme.effects.shadow4.ambient,
      key: theme.effects.shadow4.key,
    },
    depth8: {
      ambient: theme.effects.shadow8.ambient,
      key: theme.effects.shadow8.key,
    },
    depth16: {
      ambient: theme.effects.shadow16.ambient,
      key: theme.effects.shadow16.key,
    },
    depth28: {
      ambient: theme.effects.shadow28.ambient,
      key: theme.effects.shadow28.key,
    },
    depth64: {
      ambient: theme.effects.shadow64.ambient,
      key: theme.effects.shadow64.key,
    },
  };
}, 'Shadow');

export const Shadow = compressible<ShadowProps, ShadowTokens>((props: ShadowProps, useTokens: UseTokens<ShadowTokens>) => {
  const theme = useTheme();
  let [tokens, cache] = useTokens(theme);
  const { depth, padding, paddingHorizontal, style, ...rest } = props;
  [tokens, cache] = applyTokenLayers(
    tokens,
    ['depth2', 'depth4', 'depth8', 'depth16', 'depth28', 'depth64'],
    cache,
    (layer) => layer === 'depth' + depth,
  );
  [tokens, cache] = applyPropsToTokens(props, tokens, cache, ['borderColor', 'borderRadius', 'borderStyle', 'borderWidth']);
  const Root = useSlot<ViewProps>(View, {
    ...rest,
    style: mergeStyles(
      {
        backgroundColor: tokens.backgroundColor,
        shadowColor: tokens.color,
        ...borderStyles.from(tokens, theme),
        ...tokens.key,
      },
      style,
    ),
  });
  const InnerShadow = useSlot<ViewProps>(tokens.innerShadowSlot, {
    style: {
      borderRadius: tokens.borderRadius,
      shadowColor: tokens.color,
      backgroundColor: tokens.backgroundColor,
      padding,
      paddingHorizontal,
      flexGrow: 1,
      ...tokens.ambient,
    },
  });
  return (extra: ShadowProps, ...children: React.ReactNode[]) => {
    return (
      <Root {...extra}>
        <InnerShadow>{children}</InnerShadow>
      </Root>
    );
  };
}, useShadowTokens);
