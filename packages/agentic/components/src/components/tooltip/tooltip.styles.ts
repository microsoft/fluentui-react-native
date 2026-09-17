import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';

export type TooltipThemeStyles = {
  content: TextStyle;
  surface: ViewStyle;
  surfaceContent: ViewStyle;
};

export const tooltipStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  surfaceContent: {
    maxWidth: 240,
    minWidth: 160,
    overflow: 'hidden',
  },
});

/**
 * Tooltip has a single variant and no interactive surface states, so every token binding depends only on the theme and
 * is cached once per theme state.
 *
 * The visible label surface lives on `surfaceContent`, which is a React Native view that both platforms render inside
 * the popup window. The `surface` values exist only because the macOS surface layer update requires non-null fill,
 * stroke, and radius values on the native callout; the zero stroke width keeps that layer from drawing a boundary the
 * Flex tooltip does not have, and the Windows implementation does not read any of them.
 */
export const getTooltipThemeStyles = themedStyleSheetFactory<TooltipThemeStyles>('Tooltip', ({ tokens }: ThemeState) =>
  StyleSheet.create({
    content: {
      color: tokens.color.foregroundNeutralPrimary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodySmall,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodySmall,
    },
    surface: {
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderColor: tokens.color.surfaceNeutralNearer,
      borderRadius: tokens.borderRadius.base200,
      borderWidth: 0,
    },
    surfaceContent: {
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderRadius: tokens.borderRadius.base200,
      paddingHorizontal: tokens.spacing.componentBase200,
      paddingVertical: tokens.spacing.componentBase100,
    },
  }),
);
