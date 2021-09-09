import { Theme, PartialTheme, AliasColorTokens } from '@fluentui-react-native/theme-types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { ColorValue } from 'react-native';

export function createBrandedThemeWithAlias(themeName: string, theme: Theme): PartialTheme {
  if (themeName === 'HighContrast' || !theme.host.colors) {
    return {};
  }

  return {
    colors: overrideBrandAliasTokensWithOffice(themeName, theme),
  };
}

function overrideBrandAliasTokensWithOffice(themeName: string, theme: Theme): Partial<AliasColorTokens> {
  const appColors = getAppColors(theme.host.colors.AppPrimary);
  const isWhiteOrColorfulTheme = themeName === 'White' || themeName === 'Colorful';

  return {
    neutralForeground2BrandHover: isWhiteOrColorfulTheme ? appColors.shade10 : appColors.tint40,
    neutralForeground2BrandPressed: isWhiteOrColorfulTheme ? appColors.shade30 : appColors.tint10,
    neutralForeground2BrandSelected: isWhiteOrColorfulTheme ? appColors.shade20 : appColors.tint40,
    neutralForeground3BrandHover: isWhiteOrColorfulTheme ? appColors.shade10 : appColors.tint40,
    neutralForeground3BrandPressed: isWhiteOrColorfulTheme ? appColors.shade30 : appColors.tint10,
    neutralForeground3BrandSelected: isWhiteOrColorfulTheme ? appColors.shade20 : appColors.tint40,
    brandForegroundLink: isWhiteOrColorfulTheme ? appColors.primary : appColors.tint30,
    brandForegroundLinkHover: isWhiteOrColorfulTheme ? appColors.shade10 : appColors.tint40,
    brandForegroundLinkPressed: isWhiteOrColorfulTheme ? appColors.shade30 : appColors.tint10,
    brandForegroundLinkSelected: isWhiteOrColorfulTheme ? appColors.shade20 : appColors.tint40,
    compoundBrandForeground1: isWhiteOrColorfulTheme ? appColors.primary : appColors.tint30,
    compoundBrandForeground1Hover: isWhiteOrColorfulTheme ? appColors.shade10 : appColors.tint40,
    compoundBrandForeground1Pressed: isWhiteOrColorfulTheme ? appColors.shade30 : appColors.tint10,
    brandForeground1: isWhiteOrColorfulTheme ? appColors.primary : appColors.tint30,
    brandForeground2: isWhiteOrColorfulTheme ? appColors.shade10 : appColors.tint40,
    brandBackground: appColors.primary,
    brandBackgroundHover: appColors.shade10,
    brandBackgroundPressed: appColors.shade30,
    brandBackgroundSelected: appColors.shade20,
    compoundBrandBackground1: appColors.primary,
    compoundBrandBackground1Hover: appColors.shade10,
    compoundBrandBackground1Pressed: appColors.shade20,
    brandBackgroundStatic: appColors.primary,
    brandBackground2: appColors.tint40,
    neutralStrokeAccessibleSelected: appColors.primary,
    brandStroke1: appColors.primary,
    brandStroke2: appColors.tint40,
    compoundBrandStroke1: appColors.primary,
    compoundBrandStroke1Hover: appColors.shade10,
    compoundBrandStroke1Pressed: appColors.shade20,
  };
}

function getAppColors(primaryColor: ColorValue) {
  if (primaryColor === '#185abd') {
    return globalTokens.color.word;
  } else if (primaryColor === '#107c41') {
    return globalTokens.color.excel;
  } else if (primaryColor === '#d83b01') {
    return globalTokens.color.office;
  } else if (primaryColor === '#80397b') {
    return globalTokens.color.oneNote;
  } else if (primaryColor === '#0078d4') {
    return globalTokens.color.outlook;
  } else if (primaryColor === '#c43e1c') {
    return globalTokens.color.powerPoint;
  }

  return globalTokens.color.brand;
}
