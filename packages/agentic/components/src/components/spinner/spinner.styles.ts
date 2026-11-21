import type { ColorValue, ViewStyle } from 'react-native';
import type { ThemeState } from '@fluentui-react-native/design';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  getComponentTokens,
  justifyContentToken,
  numericToken,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SpinnerSize } from './spinner.types';
import schema from './spec/tokens.json' with { type: 'json' };

type SpinnerTokenState = { size: SpinnerSize };
const domains = {
  root: { style: { alignItems: alignItemsToken, justifyContent: justifyContentToken, flexShrink: numericToken }, props: {} },
  svg: { style: { flexShrink: numericToken }, props: { diameter: numericToken, strokeWidth: numericToken } },
  track: { style: {}, props: { stroke: colorToken } },
  indicator: { style: {}, props: { stroke: colorToken } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.spinner': ComponentTokenPatch<SpinnerTokenState, typeof domains>;
  }
}

const spinnerTokens = defineComponentTokens<SpinnerTokenState, typeof domains>({ id: 'furn.spinner', slots: domains, schema });

export function resolveSpinnerChrome(
  theme: ThemeState,
  size: SpinnerSize,
): {
  rootStyle: ViewStyle;
  svgStyle: ViewStyle;
  center: number;
  diameter: number;
  radius: number;
  strokeWidth: number;
  trackColor?: ColorValue;
  indicatorColor?: ColorValue;
} {
  const tokens = getComponentTokens(theme, spinnerTokens);
  const state = { size };
  const svg = resolveTokenStates(tokens.svg, state);
  const { diameter = 0, strokeWidth = 0 } = svg.props;
  const center = diameter / 2;
  return {
    rootStyle: { ...resolveTokenStates(tokens.root, state).style, height: diameter, width: diameter },
    svgStyle: svg.style,
    center,
    diameter,
    radius: Math.max(0, center - strokeWidth / 2),
    strokeWidth,
    trackColor: resolveTokenStates(tokens.track, state).props.stroke,
    indicatorColor: resolveTokenStates(tokens.indicator, state).props.stroke,
  };
}
