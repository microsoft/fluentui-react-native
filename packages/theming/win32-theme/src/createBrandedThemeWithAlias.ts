import { Theme, PartialTheme, AliasColorTokens } from '@fluentui-react-native/theme-types';

export function createBrandedThemeWithAlias(themeName: string, theme: Theme): PartialTheme {
  if (themeName === 'HighContrast' || !theme.host.colors) {
    return {};
  }

  return {
    colors: overrideBrandAliasTokensWithOffice(themeName, theme),
  };
}

function overrideBrandAliasTokensWithOffice(themeName: string, theme: Theme): Partial<AliasColorTokens> {
  const isWhiteOrColorfulTheme = themeName === 'White' || themeName === 'Colorful';

  return {
    neutralForeground2BrandHover: isWhiteOrColorfulTheme ? theme.host.colors.AppShade10 : theme.host.colors.AppTint40,
    neutralForeground2BrandPressed: isWhiteOrColorfulTheme ? theme.host.colors.AppShade30 : theme.host.colors.AppTint10,
    neutralForeground2BrandSelected: isWhiteOrColorfulTheme ? theme.host.colors.AppShade20 : theme.host.colors.AppTint40,
    neutralForeground3BrandHover: isWhiteOrColorfulTheme ? theme.host.colors.AppShade10 : theme.host.colors.AppTint40,
    neutralForeground3BrandPressed: isWhiteOrColorfulTheme ? theme.host.colors.AppShade30 : theme.host.colors.AppTint10,
    neutralForeground3BrandSelected: isWhiteOrColorfulTheme ? theme.host.colors.AppShade20 : theme.host.colors.AppTint40,
    brandForegroundLink: isWhiteOrColorfulTheme ? theme.host.colors.AppPrimary : theme.host.colors.AppTint30,
    brandForegroundLinkHover: isWhiteOrColorfulTheme ? theme.host.colors.AppShade10 : theme.host.colors.AppTint40,
    brandForegroundLinkPressed: isWhiteOrColorfulTheme ? theme.host.colors.AppShade30 : theme.host.colors.AppTint10,
    brandForegroundLinkSelected: isWhiteOrColorfulTheme ? theme.host.colors.AppShade20 : theme.host.colors.AppTint40,
    compoundBrandForeground1: isWhiteOrColorfulTheme ? theme.host.colors.AppPrimary : theme.host.colors.AppTint30,
    compoundBrandForeground1Hover: isWhiteOrColorfulTheme ? theme.host.colors.AppShade10 : theme.host.colors.AppTint40,
    compoundBrandForeground1Pressed: isWhiteOrColorfulTheme ? theme.host.colors.AppShade30 : theme.host.colors.AppTint10,
    brandForeground1: isWhiteOrColorfulTheme ? theme.host.colors.AppPrimary : theme.host.colors.AppTint30,
    brandForeground2: isWhiteOrColorfulTheme ? theme.host.colors.AppShade10 : theme.host.colors.AppTint40,
    brandBackground: theme.host.colors.AppPrimary,
    brandBackgroundHover: theme.host.colors.AppShade10,
    brandBackgroundPressed: theme.host.colors.AppShade30,
    brandBackgroundSelected: theme.host.colors.AppShade20,
    compoundBrandBackground1: theme.host.colors.AppPrimary,
    compoundBrandBackground1Hover: theme.host.colors.AppShade10,
    compoundBrandBackground1Pressed: theme.host.colors.AppShade20,
    brandBackgroundStatic: theme.host.colors.AppPrimary,
    brandBackground2: theme.host.colors.AppTint40,
    neutralStrokeAccessibleSelected: theme.host.colors.AppPrimary,
    brandStroke1: theme.host.colors.AppPrimary,
    brandStroke2: theme.host.colors.AppTint40,
    compoundBrandStroke1: theme.host.colors.AppPrimary,
    compoundBrandStroke1Hover: theme.host.colors.AppShade10,
    compoundBrandStroke1Pressed: theme.host.colors.AppShade20,
  };
}
