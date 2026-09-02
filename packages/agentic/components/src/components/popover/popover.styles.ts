import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';

export type PopoverThemeStyles = {
  surface: ViewStyle;
  surfaceContent: ViewStyle;
  contentPlaceholder: TextStyle;
};

export const popoverStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  surfaceContent: {
    overflow: 'hidden',
  },
});

/**
 * Popover has a single variant and no interactive surface states, so every token binding depends only on the theme and
 * is cached once per theme state.
 *
 * The visible surface boundary lives on `surfaceContent`, which is a React Native view that both platforms render
 * inside the popup window. The `surface` values exist only because the macOS surface layer update requires non-null
 * fill, stroke, and radius values on the native callout; the Windows implementation does not read them.
 */
export const getPopoverThemeStyles = themedStyleSheetFactory<PopoverThemeStyles>('Popover', ({ tokens }: ThemeState) =>
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
