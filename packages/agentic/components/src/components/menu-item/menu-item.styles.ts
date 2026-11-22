import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import {
  colorToken,
  defineComponentTokens,
  getComponentTokens,
  fontWeightToken,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch, ResolvedSlotTokens } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { MenuItemState } from './menu-item.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const menuItemStyles = StyleSheet.create({
  root: { flexDirection: 'row', justifyContent: 'flex-start' },
  skeletonIcon: { borderRadius: 4, height: 20, width: 20 },
  skeletonLabel: { borderRadius: 4, height: 24, width: 120 },
  skeletonSecondary: { borderRadius: 4, height: 20, width: 96 },
});

const typography = {
  fontFamily: stringToken,
  fontSize: numericToken,
  fontWeight: fontWeightToken,
  lineHeight: numericToken,
  color: colorToken,
};
const icon = { style: {}, props: iconTokenProps };
const slots = {
  root: {
    style: {
      borderRadius: numericToken,
      paddingHorizontal: numericToken,
      paddingVertical: numericToken,
      gap: numericToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  content: { style: typography, props: { gap: numericToken } },
  secondaryContent: { style: typography, props: {} },
  leadingIcon: icon,
  trailingIcon: icon,
  checkmark: icon,
  avatar: { style: { height: numericToken, width: numericToken }, props: {} },
  checkbox: {
    style: {
      backgroundColor: colorToken,
      borderColor: colorToken,
      borderRadius: numericToken,
      borderWidth: numericToken,
      height: numericToken,
      width: numericToken,
    },
    props: { iconColor: colorToken, iconSize: numericToken },
  },
};
type MenuItemAxes = Pick<MenuItemState, 'menuStyle' | 'isSelectedVisual' | 'selected' | 'visualState' | 'secondaryContentPosition'>;
type MenuItemDomains = typeof slots;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu-item': ComponentTokenPatch<MenuItemAxes, MenuItemDomains>;
  }
}
const menuItemTokenDefinition = defineComponentTokens<MenuItemAxes, MenuItemDomains>({ id: 'furn.menu-item', slots, schema });

type Chrome<K extends keyof MenuItemDomains> = ResolvedSlotTokens<MenuItemDomains[K]['style'], MenuItemDomains[K]['props']>;

export function getMenuItemChrome(state: MenuItemState): {
  root: Chrome<'root'>['style'];
  content: Chrome<'content'>;
  secondary: Chrome<'secondaryContent'>['style'];
  contentReserve: Chrome<'content'>['style'];
  secondaryReserve: Chrome<'secondaryContent'>['style'];
  leadingIcon: Chrome<'leadingIcon'>['props'];
  trailingIcon: Chrome<'trailingIcon'>['props'];
  checkmark: Chrome<'checkmark'>['props'];
  avatar: Chrome<'avatar'>['style'];
  checkbox: Chrome<'checkbox'>;
} {
  const tokens = getComponentTokens(state, menuItemTokenDefinition);
  const reserve = { ...state, isSelectedVisual: state.selectionMode !== 'multiple' };
  return {
    root: resolveTokenStates(tokens.root, state).style,
    content: resolveTokenStates(tokens.content, state),
    secondary: resolveTokenStates(tokens.secondaryContent, state).style,
    contentReserve: resolveTokenStates(tokens.content, reserve).style,
    secondaryReserve: resolveTokenStates(tokens.secondaryContent, reserve).style,
    leadingIcon: resolveTokenStates(tokens.leadingIcon, state).props,
    trailingIcon: resolveTokenStates(tokens.trailingIcon, state).props,
    checkmark: resolveTokenStates(tokens.checkmark, state).props,
    avatar: resolveTokenStates(tokens.avatar, state).style,
    checkbox: resolveTokenStates(tokens.checkbox, state),
  };
}

export function getMenuItemLeadingStyle(state: MenuItemState): ViewStyle {
  return { alignSelf: state.hasSecondaryContent && state.secondaryContentPosition === 'under' ? 'flex-start' : 'center' };
}

export function getMenuItemTrailingStyle(state: MenuItemState): ViewStyle {
  return { alignSelf: state.secondaryContentPosition === 'under' ? 'flex-start' : 'center' };
}

export function getMenuItemContentLayoutStyle(state: MenuItemState): ViewStyle {
  return state.secondaryContentPosition === 'under'
    ? { flexDirection: 'column', gap: state.contentGap }
    : { alignItems: 'center', flexDirection: 'row', gap: state.contentGap };
}
