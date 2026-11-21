import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  fontWeightToken,
  getComponentTokens,
  getGapStyleValue,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { DividerState } from './divider.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const dividerStyles = StyleSheet.create({
  root: { alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' },
  content: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, justifyContent: 'center' },
  label: { flexShrink: 1, textAlign: 'center' },
});

const slots = {
  root: { style: { flexDirection: flexDirectionToken }, props: {} },
  line: {
    style: {
      backgroundColor: colorToken,
      width: dimensionToken,
      height: dimensionToken,
      flexBasis: dimensionToken,
      flexGrow: numericToken,
    },
    props: {},
  },
  content: { style: { gap: getGapStyleValue, paddingHorizontal: dimensionToken, paddingVertical: dimensionToken }, props: {} },
  icon: { style: {}, props: iconTokenProps },
  label: {
    style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
    props: {},
  },
};
type DividerTokenState = { vertical: boolean; stub: boolean };

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.divider': ComponentTokenPatch<DividerTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<DividerTokenState, typeof slots>({ id: 'furn.divider', slots, schema });

export function getDividerChrome(state: DividerState): {
  root: ViewStyle;
  content: ViewStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
  label: TextStyle;
  before: ViewStyle;
  after: ViewStyle;
} {
  const tokens = getComponentTokens(state, definition);
  const variant = { vertical: state.vertical, stub: false };
  return {
    root: resolveTokenStates(tokens.root, variant).style,
    content: resolveTokenStates(tokens.content, variant).style,
    icon: resolveTokenStates(tokens.icon, variant).props,
    label: resolveTokenStates(tokens.label, variant).style,
    before: resolveTokenStates(tokens.line, variant, { stub: state.contentVisible && state.layout === 'start' }).style,
    after: resolveTokenStates(tokens.line, variant, { stub: state.contentVisible && state.layout === 'end' }).style,
  };
}
