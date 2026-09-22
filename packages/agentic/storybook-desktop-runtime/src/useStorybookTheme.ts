import * as React from 'react';

import { useThemeState } from '@fluentui-react-native/design';
import type { SemanticColorTokenValues, ThemeState } from '@fluentui-react-native/design';
import { darkTheme, theme as lightTheme } from '@storybook/react-native-theming';
import type { Theme } from '@storybook/react-native-theming';

export function useStorybookTheme(): Theme {
  const state = useThemeState();
  const { theme, nativeColors } = React.useMemo(() => storybookThemeFromThemeState(state), [state]);
  React.useEffect(() => {
    if (nativeColors.length > 0) {
      console.warn(
        `Storybook chrome cannot resolve native system colors; using fixed contrasting theme colors for: ${nativeColors.join(', ')}.`,
      );
    }
  }, [nativeColors]);
  return theme;
}

function storybookThemeFromThemeState({ appearance, highContrast, tokens }: ThemeState) {
  const base = highContrast || appearance.colorScheme === 'dark' ? darkTheme : lightTheme;
  const foreground = base.base === 'dark' ? 'fixedWhite' : 'fixedBlack';
  const background = base.base === 'dark' ? 'fixedBlack' : 'fixedWhite';
  const nativeColors = new Set<keyof SemanticColorTokenValues>();
  const color = (name: keyof SemanticColorTokenValues, role: 'foreground' | 'background' = 'foreground'): string => {
    const value = tokens.color[name];
    // Storybook also passes these colors to JS color utilities, not just native styles.
    if (typeof value === 'string') {
      return value;
    }
    nativeColors.add(name);
    const fallbackName = role === 'foreground' ? foreground : background;
    const fallback = tokens.color[fallbackName];
    if (typeof fallback !== 'string') {
      throw new Error(`Storybook chrome requires a literal "${fallbackName}" fallback for the "${name}" theme token.`);
    }
    return fallback;
  };

  const theme: Theme = {
    ...base,
    color: {
      ...base.color,
      primary: color('foregroundBrandPrimary'),
      secondary: color('backgroundBrandHeavy'),
      secondaryLighter: color('backgroundBrandSoft', 'background'),
      tertiary: color('foregroundSuccessPrimary'),
      ancillary: color('foregroundBrandPrimary'),
      orange: color('foregroundWarningPrimary'),
      gold: color('foregroundWarningPrimary'),
      green: color('foregroundSuccessPrimary'),
      seafoam: color('foregroundSuccessPrimary'),
      purple: color('foregroundBrandPrimary'),
      ultraviolet: color('foregroundBrandPrimary'),
      lightest: color('foregroundBrandOnloud', 'background'),
      lighter: color('surfaceNeutralNear', 'background'),
      light: color('backgroundNeutralSubtle', 'background'),
      mediumlight: color('strokeNeutralSubtle'),
      medium: color('strokeNeutralSoft'),
      mediumdark: color('foregroundNeutralSecondary'),
      dark: color('foregroundNeutralPrimary'),
      darker: color('foregroundNeutralPrimary'),
      darkest: color('foregroundNeutralPrimary'),
      border: color('strokeNeutralSoft'),
      positive: color('foregroundSuccessPrimary'),
      negative: color('foregroundDangerPrimary'),
      warning: color('foregroundWarningPrimary'),
      critical: color('foregroundDangerPrimary'),
      defaultText: color('foregroundNeutralPrimary'),
      inverseText: color('foregroundNeutralOnloud', 'background'),
      positiveText: color('foregroundSuccessPrimary'),
      negativeText: color('foregroundDangerPrimary'),
      warningText: color('foregroundWarningPrimary'),
    },
    background: {
      ...base.background,
      app: color('surfaceNeutralFar', 'background'),
      bar: color('backgroundNeutralSubtle', 'background'),
      content: color('surfaceNeutralNear', 'background'),
      preview: color('surfaceNeutralFar', 'background'),
      hoverable: color('backgroundNeutralSoft', 'background'),
      positive: color('backgroundSuccessSubtle', 'background'),
      negative: color('backgroundDangerSubtle', 'background'),
      warning: color('backgroundWarningSubtle', 'background'),
      critical: color('backgroundDangerSubtle', 'background'),
    },
    textMutedColor: color('foregroundNeutralTertiary'),
    input: {
      ...base.input,
      border: color('strokeNeutralSoft'),
      background: color('backgroundNeutralLoud', 'background'),
      color: color('foregroundNeutralPrimary'),
    },
    button: {
      ...base.button,
      background: color('backgroundNeutralLoud', 'background'),
      border: color('strokeNeutralSoft'),
    },
    boolean: {
      ...base.boolean,
      background: color('backgroundNeutralSoft', 'background'),
      selectedBackground: color('backgroundBrandHeavy'),
    },
    appBorderColor: color('strokeNeutralSubtle'),
    barTextColor: color('foregroundNeutralPrimary'),
    barHoverColor: color('foregroundBrandPrimary'),
    barSelectedColor: color('foregroundBrandPrimary'),
    barBg: color('backgroundNeutralSubtle', 'background'),
  };
  return { theme, nativeColors: [...nativeColors] };
}
