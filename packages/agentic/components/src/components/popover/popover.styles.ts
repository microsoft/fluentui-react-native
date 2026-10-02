import { StyleSheet } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';

export const popoverStyles = StyleSheet.create({
  root: { alignSelf: 'flex-start' },
  trigger: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  surfaceContent: { minWidth: 200, overflow: 'hidden' },
});

export const getPopoverThemeStyles = themedStyleSheetFactory('Popover', ({ tokens }) =>
  StyleSheet.create({
    surface: {
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderColor: tokens.color.strokeNeutralSubtle,
      borderRadius: tokens.borderRadius.base400,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
    },
    surfaceContent: {
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderColor: tokens.color.strokeNeutralSubtle,
      borderRadius: tokens.borderRadius.base400,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      padding: tokens.spacing.componentBase400,
    },
    contentPlaceholder: {
      color: tokens.color.foregroundNeutralPrimary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodySmall,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodySmall,
    },
  }),
);
