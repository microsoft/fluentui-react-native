import { StyleSheet } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { AvatarGroupSize } from './avatar-group.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = { size: AvatarGroupSize };
const slots = {
  root: { style: { gap: getGapStyleValue }, props: {} },
  overflow: { style: { backgroundColor: colorToken, borderRadius: dimensionToken, paddingHorizontal: dimensionToken }, props: {} },
  count: {
    style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, fontWeight: fontWeightToken, lineHeight: numericToken },
    props: {},
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.avatar-group': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const avatarGroupTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.avatar-group', slots, schema });

export const avatarGroupStyles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row' },
  overflow: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
