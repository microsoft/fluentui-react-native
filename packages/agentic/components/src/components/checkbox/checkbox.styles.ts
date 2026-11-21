import type { ColorValue, TextStyle, ViewStyle } from 'react-native';
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
import type { CheckboxState } from './checkbox.types';
import schema from './spec/tokens.json' with { type: 'json' };

type CheckboxTokenState = Pick<CheckboxState, 'variant' | 'showLabel' | 'renderSecondaryText'> & {
  marked: boolean;
  visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
};
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
      borderStyle: borderStyleToken,
      flexDirection: flexDirectionToken,
      justifyContent: justifyContentToken,
      minHeight: dimensionToken,
      minWidth: dimensionToken,
      gap: getGapStyleValue,
    },
    props: {},
  },
  indicator: {
    style: {
      alignItems: alignItemsToken,
      justifyContent: justifyContentToken,
      borderStyle: borderStyleToken,
      borderWidth: numericToken,
      borderRadius: numericToken,
      height: dimensionToken,
      width: dimensionToken,
      marginVertical: dimensionToken,
      backgroundColor: colorToken,
      borderColor: colorToken,
    },
    props: {},
  },
  indicatorIcon: { style: {}, props: { color: colorToken, size: numericToken } },
  labelContainer: {
    style: {
      alignItems: alignItemsToken,
      flexDirection: flexDirectionToken,
      flexShrink: numericToken,
      justifyContent: justifyContentToken,
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
    'furn.checkbox': ComponentTokenPatch<CheckboxTokenState, typeof domains>;
  }
}

const checkboxTokens = defineComponentTokens<CheckboxTokenState, typeof domains>({ id: 'furn.checkbox', slots: domains, schema });

export function resolveCheckboxChrome(state: CheckboxState): {
  root: ViewStyle;
  indicator: ViewStyle;
  indicatorIcon: { color?: ColorValue; size?: number };
  labelContainer: ViewStyle;
  label: TextStyle;
  secondaryText: TextStyle;
} {
  const tokens = getComponentTokens(state, checkboxTokens);
  const visualState = state.disabled ? 'disabled' : state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest';
  const selection = { ...state, marked: state.status !== 'unchecked', visualState } satisfies CheckboxTokenState;
  return {
    root: resolveTokenStates(tokens.root, selection).style,
    indicator: resolveTokenStates(tokens.indicator, selection).style,
    indicatorIcon: resolveTokenStates(tokens.indicatorIcon, selection).props,
    labelContainer: resolveTokenStates(tokens.labelContainer, selection).style,
    label: resolveTokenStates(tokens.label, selection).style,
    secondaryText: resolveTokenStates(tokens.secondaryText, selection).style,
  };
}
