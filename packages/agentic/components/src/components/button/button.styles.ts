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
  getGapStyleValue,
  justifyContentToken,
  numericToken,
  resolveTokenStates,
  stringToken,
  textAlignToken,
} from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { ButtonState, ButtonTokenState } from './button.types';
import schema from './spec/tokens.json' with { type: 'json' };

const buttonTokenDomains = {
  root: {
    style: {
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      borderStyle: borderStyleToken,
      flexDirection: flexDirectionToken,
      justifyContent: justifyContentToken,
      borderWidth: numericToken,
      minHeight: dimensionToken,
      minWidth: dimensionToken,
      borderRadius: dimensionToken,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      gap: getGapStyleValue,
      backgroundColor: colorToken,
      borderColor: colorToken,
    },
    props: {},
  },
  content: {
    style: {
      flexShrink: numericToken,
      textAlign: textAlignToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      lineHeight: numericToken,
      fontWeight: fontWeightToken,
      color: colorToken,
    },
    props: {},
  },
  icon: { style: {}, props: iconTokenProps },
};

type ButtonDomains = typeof buttonTokenDomains;
export type ButtonTokens = CompiledComponentTokens<ButtonTokenState, ButtonDomains>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.button': ComponentTokenPatch<ButtonTokenState, ButtonDomains>;
  }
}

export const buttonTokenDefinition = defineComponentTokens<ButtonTokenState, ButtonDomains>({
  id: 'furn.button',
  slots: buttonTokenDomains,
  schema,
});

export function getButtonVisualState(disabled: boolean, pressed: boolean, hovered: boolean): ButtonTokenState['visualState'] {
  return disabled ? 'disabled' : pressed ? 'pressed' : hovered ? 'hovered' : 'rest';
}

export function resolveButtonChrome(state: ButtonState): {
  root: ViewStyle;
  content: TextStyle;
  icon: Pick<IconElementProps, 'color' | 'width' | 'height'>;
} {
  const { buttonTokens } = state;
  const { paddingHorizontal, paddingVertical, ...frame } = resolveTokenStates(buttonTokens.root, state).style;
  const stroke = frame.borderWidth ?? 0;
  const inset = (padding: ViewStyle['paddingHorizontal']) => (typeof padding === 'number' ? Math.max(0, padding - stroke) : padding);
  const root = { ...frame, paddingHorizontal: inset(paddingHorizontal), paddingVertical: inset(paddingVertical) };
  const content = resolveTokenStates(buttonTokens.content, state).style;
  const icon = resolveTokenStates(buttonTokens.icon, state).props;
  return { root, content, icon };
}
