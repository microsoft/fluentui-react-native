import { StyleSheet } from 'react-native';
import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import { sizeNone } from '@fluentui-react-native/design/tokens/global';

export const menuStyles = StyleSheet.create({
  content: { flexDirection: 'column', gap: sizeNone },
});
export const getMenuThemeStyles = themedStyleSheetFactory('Menu', ({ tokens }) =>
  StyleSheet.create({
    padding: {
      paddingHorizontal: tokens.spacing.componentBase200,
      paddingVertical: tokens.spacing.componentBase200,
    },
  }),
);
