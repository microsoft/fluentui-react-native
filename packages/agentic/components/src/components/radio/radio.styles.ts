import type { TextStyle, ViewStyle } from 'react-native';
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
  getGapStyleValue,
  justifyContentToken,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { RadioState } from './radio.types';
import schema from './spec/tokens.json' with { type: 'json' };

type RadioTokenState = Pick<RadioState, 'selected'> & { visualState: 'rest' | 'hovered' | 'pressed' | 'disabled' };
const textStyle = {
  flexShrink: numericToken,
  fontFamily: stringToken,
  fontSize: numericToken,
  fontWeight: fontWeightToken,
  lineHeight: numericToken,
  color: colorToken,
};
const domains = {
  root: {
    style: {
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      flexDirection: flexDirectionToken,
      flexShrink: numericToken,
      justifyContent: justifyContentToken,
      borderRadius: numericToken,
      backgroundColor: colorToken,
      gap: getGapStyleValue,
    },
    props: {},
  },
  indicator: {
    style: {
      alignItems: alignItemsToken,
      flexShrink: numericToken,
      justifyContent: justifyContentToken,
      borderStyle: borderStyleToken,
      borderWidth: numericToken,
      borderRadius: numericToken,
      height: dimensionToken,
      width: dimensionToken,
      margin: dimensionToken,
      backgroundColor: colorToken,
      borderColor: colorToken,
    },
    props: {},
  },
  dot: {
    style: {
      flexShrink: numericToken,
      borderRadius: numericToken,
      height: dimensionToken,
      width: dimensionToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  labelContainer: {
    style: {
      flexShrink: numericToken,
      justifyContent: justifyContentToken,
      minWidth: dimensionToken,
      paddingEnd: dimensionToken,
      paddingVertical: dimensionToken,
      gap: getGapStyleValue,
    },
    props: {},
  },
  label: { style: textStyle, props: {} },
  secondaryText: { style: textStyle, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.radio': ComponentTokenPatch<RadioTokenState, typeof domains>;
  }
}

const radioTokens = defineComponentTokens<RadioTokenState, typeof domains>({ id: 'furn.radio', slots: domains, schema });

export function resolveRadioChrome(state: RadioState): {
  root: ViewStyle;
  indicator: ViewStyle;
  dot: ViewStyle;
  labelContainer: ViewStyle;
  label: TextStyle;
  secondaryText: TextStyle;
} {
  const tokens = getComponentTokens(state, radioTokens);
  const visualState = state.disabled ? 'disabled' : state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest';
  const selection = { ...state, visualState } satisfies RadioTokenState;
  return {
    root: resolveTokenStates(tokens.root, selection).style,
    indicator: resolveTokenStates(tokens.indicator, selection).style,
    dot: resolveTokenStates(tokens.dot, selection).style,
    labelContainer: resolveTokenStates(tokens.labelContainer, selection).style,
    label: resolveTokenStates(tokens.label, selection).style,
    secondaryText: resolveTokenStates(tokens.secondaryText, selection).style,
  };
}
