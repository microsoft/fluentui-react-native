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
  overflowToken,
  resolveTokenStates,
  stringToken,
  textAlignToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { ListItemState } from './list-item.types';
import schema from './spec/tokens.json' with { type: 'json' };

type ListItemTokenState = Pick<ListItemState, 'size' | 'selected' | 'selectionMode' | 'selectedFill' | 'secondaryContentPosition'> & {
  visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
};
const textStyle = {
  color: colorToken,
  fontFamily: stringToken,
  fontSize: numericToken,
  fontWeight: fontWeightToken,
  lineHeight: numericToken,
};
const domains = {
  root: {
    style: {
      alignItems: alignItemsToken,
      alignSelf: alignSelfToken,
      flexDirection: flexDirectionToken,
      justifyContent: justifyContentToken,
      width: dimensionToken,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      borderRadius: numericToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  content: { style: textStyle, props: {} },
  secondary: { style: { ...textStyle, flexShrink: numericToken, marginStart: dimensionToken, textAlign: textAlignToken }, props: {} },
  leading: {
    style: {
      alignItems: alignItemsToken,
      flexShrink: numericToken,
      justifyContent: justifyContentToken,
      marginEnd: dimensionToken,
    },
    props: {},
  },
  icon: { style: {}, props: iconTokenProps },
  avatar: {
    style: {
      alignItems: alignItemsToken,
      justifyContent: justifyContentToken,
      overflow: overflowToken,
      width: numericToken,
      height: numericToken,
    },
    props: {},
  },
  trailing: {
    style: {
      alignItems: alignItemsToken,
      flexDirection: flexDirectionToken,
      flexShrink: numericToken,
      gap: getGapStyleValue,
      marginStart: dimensionToken,
    },
    props: {},
  },
  contentGroup: { style: { gap: getGapStyleValue }, props: {} },
  indicator: {
    style: {
      alignItems: alignItemsToken,
      justifyContent: justifyContentToken,
      flexShrink: numericToken,
      borderStyle: borderStyleToken,
      borderWidth: numericToken,
      borderRadius: numericToken,
      width: dimensionToken,
      height: dimensionToken,
      marginEnd: dimensionToken,
      borderColor: colorToken,
      backgroundColor: colorToken,
    },
    props: { iconColor: colorToken, iconSize: numericToken },
  },
  dot: { style: { borderRadius: numericToken, width: dimensionToken, height: dimensionToken, backgroundColor: colorToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.list-item': ComponentTokenPatch<ListItemTokenState, typeof domains>;
  }
}

const listItemTokens = defineComponentTokens<ListItemTokenState, typeof domains>({ id: 'furn.list-item', slots: domains, schema });

export function resolveListItemChrome(state: ListItemState): {
  root: ViewStyle;
  content: TextStyle;
  contentHidden: TextStyle;
  secondary: TextStyle;
  leading: ViewStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
  avatar: ViewStyle;
  trailing: ViewStyle;
  contentGroup: ViewStyle;
  indicator: { style: ViewStyle; props: { iconColor?: ColorValue; iconSize?: number } };
  dot: ViewStyle;
} {
  const tokens = getComponentTokens(state, listItemTokens);
  const visualState = state.disabled ? 'disabled' : state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest';
  const selection = { ...state, visualState } satisfies ListItemTokenState;
  const avatar = resolveTokenStates(tokens.avatar, selection).style;
  return {
    root: resolveTokenStates(tokens.root, selection).style,
    content: resolveTokenStates(tokens.content, selection).style,
    contentHidden: resolveTokenStates(tokens.content, { ...selection, selected: true }).style,
    secondary: resolveTokenStates(tokens.secondary, selection).style,
    leading: resolveTokenStates(tokens.leading, selection).style,
    icon: resolveTokenStates(tokens.icon, selection).props,
    avatar: { ...avatar, borderRadius: (avatar.width ?? 0) / 2 },
    trailing: resolveTokenStates(tokens.trailing, selection).style,
    contentGroup: resolveTokenStates(tokens.contentGroup, selection).style,
    indicator: resolveTokenStates(tokens.indicator, selection),
    dot: resolveTokenStates(tokens.dot, selection).style,
  };
}
