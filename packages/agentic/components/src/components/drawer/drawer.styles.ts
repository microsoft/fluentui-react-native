import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  getGapStyleValue,
  numericToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { DrawerState } from './drawer.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<DrawerState, 'size' | 'position'>;
const slots = {
  surface: {
    style: {
      backgroundColor: colorToken,
      borderTopLeftRadius: dimensionToken,
      borderTopRightRadius: dimensionToken,
      borderColor: colorToken,
      borderEndWidth: numericToken,
      borderStartWidth: numericToken,
      borderTopWidth: numericToken,
      width: dimensionToken,
      height: dimensionToken,
      maxWidth: dimensionToken,
      maxHeight: dimensionToken,
    },
    props: {},
  },
  header: {
    style: {
      flexDirection: flexDirectionToken,
      alignItems: alignItemsToken,
      minHeight: dimensionToken,
      gap: getGapStyleValue,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
    },
    props: {},
  },
  body: { style: { flexShrink: numericToken, paddingHorizontal: dimensionToken }, props: {} },
  footer: { style: { paddingHorizontal: dimensionToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.drawer': ComponentTokenPatch<TokenState, typeof slots>;
  }
}
export const drawerTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.drawer', slots, schema });
export const drawerStyles = StyleSheet.create({
  root: { flexShrink: 1, minWidth: 0, minHeight: 0 },
  hidden: { display: 'none' },
  heading: { flex: 1, minWidth: 0 },
});
