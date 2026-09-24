import type { ColorValue } from 'react-native';

import {
  colorBrandPrimary,
  colorBrandShade10,
  colorBrandShade20,
  colorBrandShade30,
  colorBrandTint10,
  colorBrandTint20,
  colorBrandTint30,
  colorBrandTint40,
  colorExcelPrimary,
  colorExcelShade10,
  colorExcelShade20,
  colorExcelShade30,
  colorExcelTint10,
  colorExcelTint20,
  colorExcelTint30,
  colorExcelTint40,
  colorOfficePrimary,
  colorOfficeShade10,
  colorOfficeShade20,
  colorOfficeShade30,
  colorOfficeTint10,
  colorOfficeTint20,
  colorOfficeTint30,
  colorOfficeTint40,
  colorOneNotePrimary,
  colorOneNoteShade10,
  colorOneNoteShade20,
  colorOneNoteShade30,
  colorOneNoteTint10,
  colorOneNoteTint20,
  colorOneNoteTint30,
  colorOneNoteTint40,
  colorOutlookPrimary,
  colorOutlookShade10,
  colorOutlookShade20,
  colorOutlookShade30,
  colorOutlookTint10,
  colorOutlookTint20,
  colorOutlookTint30,
  colorOutlookTint40,
  colorPowerPointPrimary,
  colorPowerPointShade10,
  colorPowerPointShade20,
  colorPowerPointShade30,
  colorPowerPointTint10,
  colorPowerPointTint20,
  colorPowerPointTint30,
  colorPowerPointTint40,
  colorWordPrimary,
  colorWordShade10,
  colorWordShade20,
  colorWordShade30,
  colorWordTint10,
  colorWordTint20,
  colorWordTint30,
  colorWordTint40,
} from '@fluentui-react-native/design/tokens/global';
import type { Theme, PartialTheme, AliasColorTokens } from '@fluentui-react-native/design/theming';

/** A brand color ramp with the shades/tints used to derive the branded alias tokens for a given Office app. */
type BrandColorRamp = {
  primary: string;
  shade10: string;
  shade20: string;
  shade30: string;
  tint10: string;
  tint20: string;
  tint30: string;
  tint40: string;
};

const brandRamp: BrandColorRamp = {
  primary: colorBrandPrimary,
  shade10: colorBrandShade10,
  shade20: colorBrandShade20,
  shade30: colorBrandShade30,
  tint10: colorBrandTint10,
  tint20: colorBrandTint20,
  tint30: colorBrandTint30,
  tint40: colorBrandTint40,
};

const wordRamp: BrandColorRamp = {
  primary: colorWordPrimary,
  shade10: colorWordShade10,
  shade20: colorWordShade20,
  shade30: colorWordShade30,
  tint10: colorWordTint10,
  tint20: colorWordTint20,
  tint30: colorWordTint30,
  tint40: colorWordTint40,
};

const excelRamp: BrandColorRamp = {
  primary: colorExcelPrimary,
  shade10: colorExcelShade10,
  shade20: colorExcelShade20,
  shade30: colorExcelShade30,
  tint10: colorExcelTint10,
  tint20: colorExcelTint20,
  tint30: colorExcelTint30,
  tint40: colorExcelTint40,
};

const officeRamp: BrandColorRamp = {
  primary: colorOfficePrimary,
  shade10: colorOfficeShade10,
  shade20: colorOfficeShade20,
  shade30: colorOfficeShade30,
  tint10: colorOfficeTint10,
  tint20: colorOfficeTint20,
  tint30: colorOfficeTint30,
  tint40: colorOfficeTint40,
};

const oneNoteRamp: BrandColorRamp = {
  primary: colorOneNotePrimary,
  shade10: colorOneNoteShade10,
  shade20: colorOneNoteShade20,
  shade30: colorOneNoteShade30,
  tint10: colorOneNoteTint10,
  tint20: colorOneNoteTint20,
  tint30: colorOneNoteTint30,
  tint40: colorOneNoteTint40,
};

const outlookRamp: BrandColorRamp = {
  primary: colorOutlookPrimary,
  shade10: colorOutlookShade10,
  shade20: colorOutlookShade20,
  shade30: colorOutlookShade30,
  tint10: colorOutlookTint10,
  tint20: colorOutlookTint20,
  tint30: colorOutlookTint30,
  tint40: colorOutlookTint40,
};

const powerPointRamp: BrandColorRamp = {
  primary: colorPowerPointPrimary,
  shade10: colorPowerPointShade10,
  shade20: colorPowerPointShade20,
  shade30: colorPowerPointShade30,
  tint10: colorPowerPointTint10,
  tint20: colorPowerPointTint20,
  tint30: colorPowerPointTint30,
  tint40: colorPowerPointTint40,
};

export function createBrandedThemeWithAlias(themeName: string, theme: Theme): PartialTheme {
  if (themeName === 'HighContrast' || !theme.host.colors) {
    return {};
  }

  return {
    colors: getCurrentBrandAliasTokens(themeName, theme.host.colors.AppPrimary),
  };
}

export function getCurrentBrandAliasTokens(themeName: string, appPrimary: ColorValue): Partial<AliasColorTokens> {
  const appColors = getAppColors(appPrimary);
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

function getAppColors(primaryColor: ColorValue): BrandColorRamp {
  if (typeof primaryColor === 'string') {
    if (primaryColor.toLowerCase() === '#185abd') {
      return wordRamp;
    } else if (primaryColor.toLowerCase() === '#107c41') {
      return excelRamp;
    } else if (primaryColor.toLowerCase() === '#d83b01') {
      return officeRamp;
    } else if (primaryColor.toLowerCase() === '#80397b' || primaryColor.toLowerCase() === '#7719aa') {
      return oneNoteRamp;
    } else if (primaryColor.toLowerCase() === '#0078d4') {
      return outlookRamp;
    } else if (primaryColor.toLowerCase() === '#c43e1c') {
      return powerPointRamp;
    }
  }

  return brandRamp;
}
