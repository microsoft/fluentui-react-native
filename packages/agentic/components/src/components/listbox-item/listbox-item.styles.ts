import { StyleSheet } from 'react-native';

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
import type { ListboxItemState } from './listbox-item.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const listboxItemStyles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  leading: { alignItems: 'center', flex: 1, flexDirection: 'row', minWidth: 0 },
  leadingUnder: { alignItems: 'flex-start' },
  contentRow: { alignItems: 'center', flex: 1, flexDirection: 'row', minWidth: 0 },
  contentColumn: { flex: 1, flexDirection: 'column', minWidth: 0 },
  trailing: { alignItems: 'center', flexDirection: 'row' },
  loadingRow: { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 24 },
  loadingLabel: { borderRadius: 4 },
  loadingIcon: { borderRadius: 10 },
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
  icon,
  checkmark: icon,
  avatar: { style: { height: numericToken, width: numericToken, borderRadius: numericToken }, props: {} },
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
type ListboxItemAxes = Pick<ListboxItemState, 'variant' | 'isSelectedVisual' | 'selected' | 'visualState' | 'secondaryContentPosition'>;
type ListboxItemDomains = typeof slots;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.listbox-item': ComponentTokenPatch<ListboxItemAxes, ListboxItemDomains>;
  }
}
const listboxItemTokenDefinition = defineComponentTokens<ListboxItemAxes, ListboxItemDomains>({ id: 'furn.listbox-item', slots, schema });

type Chrome<K extends keyof ListboxItemDomains> = ResolvedSlotTokens<ListboxItemDomains[K]['style'], ListboxItemDomains[K]['props']>;

export function getListboxItemChrome(state: ListboxItemState): {
  root: Chrome<'root'>['style'];
  content: Chrome<'content'>;
  secondary: Chrome<'secondaryContent'>['style'];
  contentReserve: Chrome<'content'>['style'];
  icon: Chrome<'icon'>['props'];
  checkmark: Chrome<'checkmark'>['props'];
  avatar: Chrome<'avatar'>['style'];
  checkbox: Chrome<'checkbox'>;
} {
  const tokens = getComponentTokens(state, listboxItemTokenDefinition);
  return {
    root: resolveTokenStates(tokens.root, state).style,
    content: resolveTokenStates(tokens.content, state),
    contentReserve: resolveTokenStates(tokens.content, { ...state, isSelectedVisual: true }).style,
    secondary: resolveTokenStates(tokens.secondaryContent, state).style,
    icon: resolveTokenStates(tokens.icon, state).props,
    checkmark: resolveTokenStates(tokens.checkmark, state).props,
    avatar: resolveTokenStates(tokens.avatar, state).style,
    checkbox: resolveTokenStates(tokens.checkbox, state),
  };
}
