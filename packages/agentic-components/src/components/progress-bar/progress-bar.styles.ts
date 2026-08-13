import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import { cornerRadiusCircular, size160 } from '@fluentui-react-native/design/tokens/global';

export type ProgressBarThemeStyles = {
  header: ViewStyle;
  indicator: ViewStyle;
  label: TextStyle;
  root: ViewStyle;
  trailing: ViewStyle;
  track: ViewStyle;
  validationIcon: ViewStyle;
  valueText: TextStyle;
};

const progressBarThemeStylesKey = Symbol('ProgressBar.themeStyles');

export function getProgressBarThemeStyles(themeState: ThemeState): ProgressBarThemeStyles {
  const cachedStyles = themeState.themeStyles[progressBarThemeStylesKey] as ProgressBarThemeStyles | undefined;
  if (cachedStyles) {
    return cachedStyles;
  }

  const { color, fontFamily, fontSize, lineHeight, spacing } = themeState.tokens;

  const styles = StyleSheet.create<ProgressBarThemeStyles>({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.componentBase100,
      minWidth: 0,
    },
    indicator: {
      backgroundColor: color.foregroundBrandPrimary,
      borderRadius: cornerRadiusCircular,
      bottom: 0,
      left: 0,
      position: 'absolute',
      top: 0,
    },
    label: {
      color: color.foregroundNeutralPrimary,
      flexShrink: 1,
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodyMedium,
      lineHeight: lineHeight.functionalBodyMedium,
      minWidth: 0,
    },
    root: {
      alignSelf: 'stretch',
      flexShrink: 1,
    },
    trailing: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 0,
      gap: spacing.componentBase100,
    },
    track: {
      backgroundColor: color.backgroundNeutralSoft,
      borderRadius: cornerRadiusCircular,
      height: spacing.componentBase100,
      overflow: 'hidden',
      position: 'relative',
    },
    validationIcon: {
      height: size160,
      width: size160,
    },
    valueText: {
      color: color.foregroundNeutralSecondary,
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      lineHeight: lineHeight.functionalBodySmall,
    },
  });

  themeState.themeStyles[progressBarThemeStylesKey] = styles;
  return styles;
}
