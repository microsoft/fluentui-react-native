import { Theme, AliasColorTokens } from '@fluentui-react-native/theme-types';

export function createBrandedThemeWithAlias(theme: Theme): Theme {
  if (!theme.host.colors) {
    return theme;
  }

  return {
    ...theme,
    colors: {
      ...theme.colors,
      ...overrideBrandAliasTokensWithOffice(theme),
    },
  };
}

function overrideBrandAliasTokensWithOffice(theme: Theme): Partial<AliasColorTokens> {
  console.log(theme.host.colors.AppPrimary);
  return {
    neutralForeground2BrandHover: theme.host.colors.AppPrimary,
    neutralForeground2BrandPressed: theme.host.colors.AppShade10,
    neutralForeground3BrandHover: theme.host.colors.AppPrimary,
    neutralForeground3BrandPressed: theme.host.colors.AppShade10,
    brandForegroundLink: theme.host.colors.AppShade10,
    brandForegroundLinkHover: theme.host.colors.AppShade20,
    brandForegroundLinkPressed: theme.host.colors.AppShade30,
    compoundBrandForeground1: theme.host.colors.AppPrimary,
    compoundBrandForeground1Hover: theme.host.colors.AppShade10,
    compoundBrandForeground1Pressed: theme.host.colors.AppShade20,
    brandForeground1: theme.host.colors.AppPrimary,
    brandForeground2: theme.host.colors.AppShade10,
    brandBackground: theme.host.colors.AppPrimary,
    brandBackgroundHover: theme.host.colors.AppShade10,
    brandBackgroundPressed: theme.host.colors.AppShade30,
    compoundBrandBackground1: theme.host.colors.AppPrimary,
    compoundBrandBackground1Hover: theme.host.colors.AppShade10,
    compoundBrandBackground1Pressed: theme.host.colors.AppShade20,
    brandStroke1: theme.host.colors.AppPrimary,
    brandStroke2: theme.host.colors.AppTint40,
    compoundBrandStroke1: theme.host.colors.AppPrimary,
    compoundBrandStroke1Hover: theme.host.colors.AppShade10,
    compoundBrandStroke1Pressed: theme.host.colors.AppShade20,
  };
}
