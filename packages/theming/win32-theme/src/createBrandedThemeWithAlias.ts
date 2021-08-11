import { Theme, PartialTheme, AliasColorTokens } from '@fluentui-react-native/theme-types';

export function createBrandedThemeWithAlias(theme: Theme): PartialTheme {
  if (!theme.host.colors) {
    return {};
  }

  return {
    colors: overrideBrandAliasTokensWithOffice(theme),
  };
}

function overrideBrandAliasTokensWithOffice(theme: Theme): Partial<AliasColorTokens> {
  return {
    neutralForeground2BrandHover: theme.host.colors.AppPrimary,
    neutralForeground2BrandPressed: theme.host.colors.AppShade10,
    neutralForeground2BrandSelected: theme.host.colors.AppPrimary,
    neutralForeground3BrandHover: theme.host.colors.AppPrimary,
    neutralForeground3BrandPressed: theme.host.colors.AppShade10,
    neutralForeground3BrandSelected: theme.host.colors.AppPrimary,
    brandForegroundLink: theme.host.colors.AppShade10,
    brandForegroundLinkHover: theme.host.colors.AppShade20,
    brandForegroundLinkPressed: theme.host.colors.AppShade30,
    brandForegroundLinkSelected: theme.host.colors.AppShade10,
    compoundBrandForeground1: theme.host.colors.AppPrimary,
    compoundBrandForeground1Hover: theme.host.colors.AppShade10,
    compoundBrandForeground1Pressed: theme.host.colors.AppShade20,
    brandForeground1: theme.host.colors.AppPrimary,
    brandForeground2: theme.host.colors.AppShade10,
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
