import { StyleSheet } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  fontWeightToken,
  getComponentTokens,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { AvatarState } from './avatar.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const avatarStyles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', position: 'relative' },
  image: { ...StyleSheet.absoluteFillObject },
  initials: { flexShrink: 1, includeFontPadding: false, padding: 0, position: 'absolute', textAlign: 'center' },
});

const slots = {
  root: {
    style: {
      backgroundColor: colorToken,
      borderRadius: dimensionToken,
      height: dimensionToken,
      minHeight: dimensionToken,
      minWidth: dimensionToken,
      padding: dimensionToken,
      width: dimensionToken,
    },
    props: {},
  },
  image: { style: { borderRadius: numericToken }, props: {} },
  initials: { style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken }, props: {} },
  icon: { style: {}, props: iconTokenProps },
  activityRing: {
    style: { borderColor: colorToken, borderRadius: dimensionToken, borderWidth: numericToken },
    props: { gap: numericToken },
  },
};
type AvatarTokenState = Pick<AvatarState, 'size' | 'contentMode'>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.avatar': ComponentTokenPatch<AvatarTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<AvatarTokenState, typeof slots>({ id: 'furn.avatar', slots, schema });

export function getAvatarChrome(state: AvatarState): {
  root: ViewStyle;
  image: ImageStyle;
  initials: TextStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
  activityRing: { style: ViewStyle; props: { gap?: number } };
} {
  const tokens = getComponentTokens(state, definition);
  return {
    root: resolveTokenStates(tokens.root, state).style,
    image: resolveTokenStates(tokens.image, state).style,
    initials: resolveTokenStates(tokens.initials, state).style,
    icon: resolveTokenStates(tokens.icon, state).props,
    activityRing: resolveTokenStates(tokens.activityRing, state),
  };
}
