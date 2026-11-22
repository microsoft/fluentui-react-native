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
  textAlignToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { TabState } from './tab.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TabTokenState = Pick<TabState, 'layout' | 'selected'> & { visualState: 'rest' | 'hovered' | 'pressed' | 'disabled' };
const domains = {
  root: {
    style: {
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      borderStyle: borderStyleToken,
      flexDirection: flexDirectionToken,
      justifyContent: justifyContentToken,
      borderRadius: numericToken,
      gap: getGapStyleValue,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  content: {
    style: {
      flexShrink: numericToken,
      textAlign: textAlignToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      fontWeight: fontWeightToken,
      lineHeight: numericToken,
      color: colorToken,
    },
    props: {},
  },
  icon: { style: {}, props: iconTokenProps },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.tab': ComponentTokenPatch<TabTokenState, typeof domains>;
  }
}

const tabTokens = defineComponentTokens<TabTokenState, typeof domains>({ id: 'furn.tab', slots: domains, schema });

export function resolveTabChrome(state: TabState): {
  root: ViewStyle;
  content: TextStyle;
  contentHidden: TextStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
} {
  const tokens = getComponentTokens(state, tabTokens);
  const visualState = state.disabled ? 'disabled' : state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest';
  const selection = { ...state, visualState } satisfies TabTokenState;
  const content = resolveTokenStates(tokens.content, selection).style;
  return {
    root: resolveTokenStates(tokens.root, selection).style,
    content,
    contentHidden: { ...content, fontWeight: resolveTokenStates(tokens.content, { ...selection, selected: true }).style.fontWeight },
    icon: resolveTokenStates(tokens.icon, selection).props,
  };
}
