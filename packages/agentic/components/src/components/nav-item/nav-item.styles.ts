import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { AvatarSize } from '../avatar/avatar.types';
import type { NavItemState } from './nav-item.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<NavItemState, 'density' | 'nesting' | 'highlighted' | 'visualState'>;
const slots = {
  primary: {
    style: {
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      gap: getGapStyleValue,
      paddingVertical: dimensionToken,
      paddingHorizontal: dimensionToken,
      paddingStart: dimensionToken,
      backgroundColor: colorToken,
      borderRadius: dimensionToken,
    },
    props: {},
  },
  leading: {
    style: {},
    props: {
      ...iconTokenProps,
      avatarSize: (value: unknown): AvatarSize => {
        switch (value) {
          case 16:
          case 20:
          case 24:
          case 28:
          case 32:
          case 40:
          case 56:
          case 120:
            return value;
          default:
            throw new TypeError('Expected a supported Avatar size.');
        }
      },
    },
  },
  label: {
    style: {
      fontFamily: stringToken,
      fontSize: numericToken,
      lineHeight: numericToken,
      fontWeight: fontWeightToken,
      color: colorToken,
      flexShrink: numericToken,
    },
    props: {},
  },
  indicator: { style: { backgroundColor: colorToken, width: dimensionToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.nav-item': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const navItemTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.nav-item', slots, schema });
export const navItemStyles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  primary: { flex: 1, minWidth: 0 },
  indicator: { position: 'absolute', top: '25%', bottom: '25%', start: 0 },
  label: { flexGrow: 1 },
  iconOnly: { justifyContent: 'center' },
  secondary: { alignSelf: 'center' },
});
