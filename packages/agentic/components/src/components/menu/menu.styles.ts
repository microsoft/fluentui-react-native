import { StyleSheet } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';
import { getNumericStyleValue } from '@fluentui-react-native/design/styling';

export const menuStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
});

/** Popover's surface bindings with Menu's tighter padding; rows stack without a gap. */
export const getMenuThemeStyles = themedStyleSheetFactory('Menu.surface', ({ tokens }) =>
  StyleSheet.create({
    surface: {
      backgroundColor: tokens.color.surfaceNeutralNearer.rest,
      borderColor: tokens.color.strokeNeutralSubtle.rest,
      borderRadius: tokens.borderRadius.base400,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      padding: tokens.spacing.componentBase200,
    },
  }),
);

/** The trigger-to-menu and row-to-submenu gap. Native placement requires a nonnegative integer in logical units. */
export function getMenuGap(tokens: FlexTokens): number {
  return Math.max(0, Math.round(Number(getNumericStyleValue(tokens.spacing.componentBase100))));
}
