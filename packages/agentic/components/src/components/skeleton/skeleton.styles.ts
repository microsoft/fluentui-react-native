import type { ViewStyle } from 'react-native';
import type { ThemeState } from '@fluentui-react-native/design';
import {
  colorToken,
  defineComponentTokens,
  getComponentTokens,
  numericToken,
  overflowToken,
  pointerEventsToken,
  positionToken,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import schema from './spec/tokens.json' with { type: 'json' };

type SkeletonTokenState = { silhouette: 'animated' | 'static' | 'opaque' };
const domains = {
  root: {
    style: {
      overflow: overflowToken,
      position: positionToken,
      backgroundColor: colorToken,
      borderRadius: numericToken,
      borderColor: colorToken,
      borderWidth: numericToken,
    },
    props: {},
  },
  shimmerContainer: {
    style: {
      bottom: numericToken,
      left: numericToken,
      overflow: overflowToken,
      pointerEvents: pointerEventsToken,
      position: positionToken,
      top: numericToken,
    },
    props: {},
  },
  gradient: { style: {}, props: { stopColor: colorToken, centerOpacity: numericToken } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.skeleton': ComponentTokenPatch<SkeletonTokenState, typeof domains>;
  }
}

const skeletonTokens = defineComponentTokens<SkeletonTokenState, typeof domains>({ id: 'furn.skeleton', slots: domains, schema });

export function resolveSkeletonChrome(
  theme: ThemeState,
  reduceMotion: boolean,
): {
  root: ViewStyle;
  shimmerContainer: ViewStyle;
  shimmerColor?: string;
  centerOpacity: number;
} {
  const tokens = getComponentTokens(theme, skeletonTokens);
  const gradient = resolveTokenStates(tokens.gradient, { silhouette: 'animated' }).props;
  const color = gradient.stopColor;
  const silhouette = typeof color !== 'string' ? 'opaque' : reduceMotion ? 'static' : 'animated';
  return {
    root: resolveTokenStates(tokens.root, { silhouette }).style,
    shimmerContainer: resolveTokenStates(tokens.shimmerContainer, { silhouette }).style,
    shimmerColor: typeof color === 'string' ? color : undefined,
    centerOpacity: gradient.centerOpacity ?? 0,
  };
}
