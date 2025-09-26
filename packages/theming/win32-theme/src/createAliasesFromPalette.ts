import type { AliasColorTokens, OfficePalette } from '@fluentui-react-native/theme-types';

export function createAliasesFromPalette(palette: OfficePalette, isHighContrast: boolean): Partial<AliasColorTokens> {
  // Workaround for getting checkmark to have correct color in HC
  // while native code doesn't support PlatformColor
  if (isHighContrast) {
    return {};
  }

  return {
    neutralForeground1: palette.Text,
    neutralForeground1Hover: palette.TextHover,
    neutralForeground1Pressed: palette.TextPressed,
    neutralForeground1Selected: palette.TextSelected,
    neutralForeground2: palette.TextSecondary,
    neutralForeground2Hover: palette.TextSecondaryHover,
    neutralForeground2Pressed: palette.TextSecondaryPressed,
    neutralForeground2Selected: palette.TextSecondarySelected,
    neutralForeground4: palette.TextTextBoxPlaceholder,
    neutralForegroundDisabled: palette.TextDisabled,

    compoundBrandForeground1: palette.TextEmphasis,
    compoundBrandForeground1Hover: palette.TextEmphasisHover,
    compoundBrandForeground1Pressed: palette.TextEmphasisPressed,

    neutralForegroundOnBrand: palette.TextCtlEmphasis,
    neutralForegroundOnBrandHover: palette.TextCtlEmphasisHover,
    neutralForegroundOnBrandPressed: palette.TextCtlEmphasisPressed,
    neutralForegroundInvertedLink: palette.BkgToggleSwitchOff,
    neutralForegroundInvertedLinkHover: palette.BkgToggleSwitchOffHover,
    neutralForegroundInvertedLinkPressed: palette.BkgToggleSwitchOffPressed,

    neutralBackground1: palette.Bkg,
    neutralBackground1Hover: palette.BkgHover,
    neutralBackground1Pressed: palette.BkgPressed,
    neutralBackground1Selected: palette.BkgSelected,
    neutralBackground2: palette.BkgHeader,
    neutralBackground2Hover: palette.BkgSubtle,
    neutralBackground3: palette.BkgSubtle,
    neutralBackgroundInverted: palette.BkgSelectionHighlight,
    neutralBackgroundDisabled: palette.BkgCtlDisabled,

    neutralStencil1: palette.SliderBuffer,

    brandBackground: palette.BkgCtlEmphasis,
    brandBackgroundHover: palette.BkgCtlEmphasisHover,
    brandBackgroundPressed: palette.BkgCtlEmphasisPressed,

    compoundBrandBackground1: palette.BkgToggleSwitchOn,
    compoundBrandBackground1Hover: palette.BkgToggleSwitchOnHover,
    compoundBrandBackground1Pressed: palette.BkgToggleSwitchOnPressed,

    neutralStrokeAccessible: palette.StrokeOnlySelected,
    neutralStrokeAccessibleHover: palette.StrokeOnlyHover,
    neutralStrokeAccessiblePressed: palette.StrokeOnlyPressed,
    neutralStroke1: palette.StrokeCtl,
    neutralStroke1Hover: palette.StrokeSelectedHover,
    neutralStroke1Pressed: palette.StrokeOverPressed,
    neutralStroke2: palette.SliderBuffer,
    brandStroke1: palette.AccentEmphasis,
    compoundBrandStroke1: palette.StrokeToggleSwitchOn,
    compoundBrandStroke1Hover: palette.StrokeToggleSwitchOnHover,
    compoundBrandStroke1Pressed: palette.StrokeToggleSwitchOnPressed,
    neutralStrokeDisabled: palette.StrokeCtlDisabled,

    strokeFocus2: palette.StrokeKeyboard,
  };
}
