import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import {
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
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { TagState } from './tag.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const tagStyles = StyleSheet.create({
  root: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', justifyContent: 'center' },
  content: { flexShrink: 1, textAlign: 'center' },
  icon: { flexShrink: 0 },
});

const slots = {
  root: {
    style: {
      backgroundColor: colorToken,
      borderRadius: dimensionToken,
      gap: getGapStyleValue,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
    },
    props: {},
  },
  content: {
    style: {
      color: colorToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      fontWeight: fontWeightToken,
      lineHeight: numericToken,
      paddingHorizontal: dimensionToken,
    },
    props: {},
  },
  leadingIcon: { style: {}, props: iconTokenProps },
  dismissIcon: { style: {}, props: iconTokenProps },
};
type TagTokenState = Pick<TagState, 'appearance' | 'layout' | 'shape' | 'size'> & {
  visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.tag': ComponentTokenPatch<TagTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<TagTokenState, typeof slots>({ id: 'furn.tag', slots, schema });

type IconChrome = Pick<IconElementProps, 'color' | 'height' | 'width'>;

export function getTagChrome(state: TagState): {
  root: ViewStyle;
  content: TextStyle;
  leadingIcon: IconChrome;
  dismissIcon: IconChrome;
} {
  const tokens = getComponentTokens(state.themeState, definition);
  const variant: TagTokenState = {
    appearance: state.appearance,
    layout: state.layout,
    shape: state.shape,
    size: state.size,
    visualState: state.disabled ? 'disabled' : state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest',
  };
  return {
    root: resolveTokenStates(tokens.root, variant).style,
    content: resolveTokenStates(tokens.content, variant).style,
    leadingIcon: resolveTokenStates(tokens.leadingIcon, variant).props,
    dismissIcon: resolveTokenStates(tokens.dismissIcon, variant).props,
  };
}
