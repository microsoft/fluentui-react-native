import { StyleSheet } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';
import { getNumericStyleValue } from '@fluentui-react-native/design/styling';

export const popoverStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
});

export const getPopoverThemeStyles = themedStyleSheetFactory('Popover.surface', ({ tokens }) =>
  StyleSheet.create({
    surface: {
      backgroundColor: tokens.color.surfaceNeutralNearer.rest,
      borderColor: tokens.color.strokeNeutralSubtle.rest,
      borderRadius: tokens.borderRadius.base400,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      padding: tokens.spacing.componentBase400,
    },
  }),
);

/** The trigger-to-surface gap. Native placement requires a nonnegative integer in logical units. */
export function getPopoverGap(tokens: FlexTokens): number {
  return Math.max(0, Math.round(Number(getNumericStyleValue(tokens.spacing.componentBase100))));
}
