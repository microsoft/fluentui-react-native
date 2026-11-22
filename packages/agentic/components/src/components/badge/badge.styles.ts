import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import type { ThemeState } from '@fluentui-react-native/design';
import {
  assetField,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  fontWeightToken,
  getComponentTokens,
  getGapStyleValue,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';
import { parseStatusBadgeSource, statusBadgeAssets } from './badge.assets';
import type { BadgeState } from './badge.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const badgeStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  content: { flexShrink: 1, textAlign: 'center' },
});

const slots = {
  root: {
    style: {
      borderRadius: dimensionToken,
      borderWidth: numericToken,
      borderColor: colorToken,
      backgroundColor: colorToken,
      gap: getGapStyleValue,
      height: dimensionToken,
      width: dimensionToken,
      minHeight: dimensionToken,
      minWidth: dimensionToken,
      paddingHorizontal: dimensionToken,
    },
    props: {},
  },
  tint: { style: { backgroundColor: colorToken }, props: {} },
  content: {
    style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
    props: {},
  },
  icon: { style: {}, props: iconTokenProps },
  statusIcon: { style: {}, props: { source: assetField('fluent-icon', statusBadgeAssets, parseStatusBadgeSource) } },
};

type BadgeTokenState = Pick<BadgeState, 'appearance' | 'color' | 'layout' | 'shape' | 'size'>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.badge': ComponentTokenPatch<BadgeTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<BadgeTokenState, typeof slots>({ id: 'furn.badge', slots, schema });

export function getBadgeStatusIcon(theme: ThemeState, variant: BadgeTokenState): SvgIconSource | undefined {
  return resolveTokenStates(getComponentTokens(theme, definition).statusIcon, variant).props.source;
}

export function getBadgeChrome(state: BadgeState): {
  root: ViewStyle;
  tint: ViewStyle;
  content: TextStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
} {
  const tokens = getComponentTokens(state.themeState, definition);
  return {
    root: resolveTokenStates(tokens.root, state).style,
    tint: resolveTokenStates(tokens.tint, state).style,
    content: resolveTokenStates(tokens.content, state).style,
    icon: resolveTokenStates(tokens.icon, state).props,
  };
}
