import { AliasColorTokens, OfficePalette } from '@fluentui-react-native/theme-types';

export function createAliasesFromPalette(palette: OfficePalette): Partial<AliasColorTokens> {
  return {
    neutralForeground1: palette.Text,
    neutralForeground2: palette.TextSecondary,
    neutralForeground2Hover: palette.TextSecondaryHover,
    neutralForeground2Pressed: palette.TextSecondaryPressed,
    neutralForeground2Selected: palette.TextSecondarySelected,
    neutralForeground4: palette.TextCtlSubtlePlaceholder,
    neutralForegroundDisabled: palette.TextDisabled,

    compoundBrandForeground1: palette.TextEmphasis,
    compoundBrandForeground1Hover: palette.TextEmphasisHover,
    compoundBrandForeground1Pressed: palette.TextEmphasisPressed,

    neutralForegroundInverted: palette.TextCtlSubtleSelectionHighlight,
    neutralForegroundInvertedLink: palette.TextCtlEmphasis,
    neutralForegroundInvertedLinkHover: palette.TextCtlEmphasisHover,
    neutralForegroundInvertedLinkPressed: palette.TextCtlEmphasisPressed,

    neutralBackground1: palette.Bkg,
    neutralBackground1Hover: palette.BkgHover,
    neutralBackground1Pressed: palette.BkgPressed,
    neutralBackground1Selected: palette.BkgSelected,
    neutralBackground2: palette.BkgHeader,
    neutralBackground2Hover: palette.BkgSubtle,
    neutralBackground3: palette.BkgSubtle,
    neutralBackgroundInverted: palette.BkgSelectionHighlight,
    neutralBackgroundDisabled: palette.BkgCtlDisabled,

    brandBackground1: palette.BkgCtlEmphasis,
    brandBackground1Hover: palette.BkgCtlEmphasisHover,
    brandBackground1Pressed: palette.BkgCtlEmphasisPressed,

    neutralStrokeAccessible: palette.StrokeOverSelectedRest,
    neutralStrokeAccessibleHover: palette.StrokeOverSelectedHover,
    neutralStrokeAccessiblePressed: palette.StrokeOverSelectedPressed,
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
