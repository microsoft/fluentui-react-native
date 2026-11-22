import type { TextStyle, ViewStyle } from 'react-native';
import type { ThemeState } from '@fluentui-react-native/design';
import {
  alignItemsToken,
  alignSelfToken,
  borderStyleToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  fontWeightToken,
  getComponentTokens,
  justifyContentToken,
  numericToken,
  positionToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SwitchState } from './switch.types';
import schema from './spec/tokens.json' with { type: 'json' };

type SwitchTokenState = Pick<SwitchState, 'checked' | 'layout'> & { visualState: 'rest' | 'hovered' | 'pressed' | 'disabled' };
const domains = {
  container: {
    style: {
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      flexDirection: flexDirectionToken,
    },
    props: {},
  },
  root: {
    style: {
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      backgroundColor: colorToken,
      borderStyle: borderStyleToken,
      justifyContent: justifyContentToken,
      minHeight: dimensionToken,
      minWidth: dimensionToken,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      borderRadius: numericToken,
    },
    props: {},
  },
  track: {
    style: {
      alignItems: alignItemsToken,
      justifyContent: justifyContentToken,
      position: positionToken,
      borderStyle: borderStyleToken,
      width: numericToken,
      height: numericToken,
      borderRadius: numericToken,
      borderWidth: numericToken,
      flexShrink: numericToken,
      backgroundColor: colorToken,
      borderColor: colorToken,
    },
    props: {},
  },
  thumb: {
    style: {
      width: numericToken,
      height: numericToken,
      position: positionToken,
      start: numericToken,
      top: numericToken,
      borderRadius: numericToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  label: {
    style: {
      flexShrink: numericToken,
      minWidth: dimensionToken,
      color: colorToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      fontWeight: fontWeightToken,
      lineHeight: numericToken,
    },
    props: {},
  },
  beforeLabel: { style: { paddingStart: dimensionToken, paddingEnd: dimensionToken }, props: {} },
  afterLabel: { style: { paddingStart: dimensionToken, paddingEnd: dimensionToken }, props: {} },
  aboveLabel: { style: { paddingTop: dimensionToken, paddingBottom: dimensionToken }, props: {} },
  motion: { style: {}, props: { duration: numericToken } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.switch': ComponentTokenPatch<SwitchTokenState, typeof domains>;
  }
}

const switchTokens = defineComponentTokens<SwitchTokenState, typeof domains>({ id: 'furn.switch', slots: domains, schema });

export function getSwitchDuration(theme: ThemeState, state: SwitchTokenState) {
  return resolveTokenStates(getComponentTokens(theme, switchTokens).motion, state).props.duration ?? 0;
}

export function resolveSwitchChrome(state: SwitchState): {
  container: ViewStyle;
  root: ViewStyle;
  track: ViewStyle & { width?: number };
  thumb: ViewStyle & { start?: number; width?: number };
  label: TextStyle;
  beforeLabel: TextStyle;
  afterLabel: TextStyle;
  aboveLabel: TextStyle;
} {
  const tokens = getComponentTokens(state, switchTokens);
  const visualState = state.disabled ? 'disabled' : state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest';
  const selection = { ...state, visualState } satisfies SwitchTokenState;
  return {
    container: resolveTokenStates(tokens.container, selection).style,
    root: resolveTokenStates(tokens.root, selection).style,
    track: resolveTokenStates(tokens.track, selection).style,
    thumb: resolveTokenStates(tokens.thumb, selection).style,
    label: resolveTokenStates(tokens.label, selection).style,
    beforeLabel: resolveTokenStates(tokens.beforeLabel, selection).style,
    afterLabel: resolveTokenStates(tokens.afterLabel, selection).style,
    aboveLabel: resolveTokenStates(tokens.aboveLabel, selection).style,
  };
}
