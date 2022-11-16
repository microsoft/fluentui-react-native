import { AliasColorTokens, Variants, VariantValue } from '@fluentui-react-native/theme-types';

// API that translates tokens coming for android to Theme color values.
// This is implemented in a per-plaform fashion, for each endpoint that maps to similar token sets in design - i.e. map to similar
// pipeline output.
export function mapPipelineToTheme(pipelineOutput: any): AliasColorTokens {
  return {
    neutralForeground1: pipelineOutput.neutralForeground1.fillColorRest,
    neutralForeground1Hover: pipelineOutput.neutralForeground1.fillColorHover,
    neutralForeground1Pressed: pipelineOutput.neutralForeground1.fillColorPressed,
    neutralForeground1Selected: pipelineOutput.neutralForeground1.fillColorSelected,
    neutralForeground2: pipelineOutput.neutralForeground2.fillColorRest,
    neutralForeground2Hover: pipelineOutput.neutralForeground2.fillColorHover,
    neutralForeground2Pressed: pipelineOutput.neutralForeground2.fillColorPressed,
    neutralForeground2Selected: pipelineOutput.neutralForeground2.fillColorSelected,
    neutralForeground2BrandHover: pipelineOutput.neutralForeground2.fillColorBrandHover,
    neutralForeground2BrandPressed: pipelineOutput.neutralForeground2.fillColorBrandPressed,
    neutralForeground2BrandSelected: pipelineOutput.neutralForeground2.fillColorBrandSelected,
    neutralForeground3: pipelineOutput.neutralForeground3.fillColorRest,
    neutralForeground3Hover: pipelineOutput.neutralForeground3.fillColorHover,
    neutralForeground3Pressed: pipelineOutput.neutralForeground3.fillColorPressed,
    neutralForeground3Selected: pipelineOutput.neutralForeground3.fillColorSelected,
    neutralForeground3BrandHover: pipelineOutput.neutralForeground3.fillColorBrandHover,
    neutralForeground3BrandPressed: pipelineOutput.neutralForeground3.fillColorBrandPressed,
    neutralForeground3BrandSelected: pipelineOutput.neutralForeground3.fillColorBrandSelected,
    neutralForegroundInverted: pipelineOutput.neutralForegroundInverted.fillColorRest,
    neutralForegroundDisabled1: pipelineOutput.neutralForegroundDisabled1.fillColorRest,
    neutralForegroundDisabled2: pipelineOutput.neutralForegroundDisabled2.fillColorRest,

    neutralForegroundOnColor: pipelineOutput.neutralForegroundOnColor.fillColorRest,

    neutralBackground1: pipelineOutput.neutralBackground1.fillColorRest,
    neutralBackground1Hover: pipelineOutput.neutralBackground1.fillColorHover,
    neutralBackground1Pressed: pipelineOutput.neutralBackground1.fillColorPressed,
    neutralBackground1Selected: pipelineOutput.neutralBackground1.fillColorSelected,
    neutralBackground2: pipelineOutput.neutralBackground2.fillColorRest,
    neutralBackground2Hover: pipelineOutput.neutralBackground2.fillColorHover,
    neutralBackground2Pressed: pipelineOutput.neutralBackground2.fillColorPressed,
    neutralBackground2Selected: pipelineOutput.neutralBackground2.fillColorSelected,

    neutralBackground3: pipelineOutput.neutralBackground3.fillColorRest,
    neutralBackground3Hover: pipelineOutput.neutralBackground3.fillColorHover,
    neutralBackground3Pressed: pipelineOutput.neutralBackground3.fillColorPressed,
    neutralBackground3Selected: pipelineOutput.neutralBackground3.fillColorSelected,

    neutralBackground4: pipelineOutput.neutralBackground4.fillColorRest,
    neutralBackground4Hover: pipelineOutput.neutralBackground4.fillColorHover,
    neutralBackground4Pressed: pipelineOutput.neutralBackground4.fillColorPressed,
    neutralBackground4Selected: pipelineOutput.neutralBackground4.fillColorSelected,

    neutralBackground5: pipelineOutput.neutralBackground5.fillColorRest,
    neutralBackground5Hover: pipelineOutput.neutralBackground5.fillColorHover,
    neutralBackground5Pressed: pipelineOutput.neutralBackground5.fillColorPressed,
    neutralBackground5Selected: pipelineOutput.neutralBackground5.fillColorSelected,

    neutralBackground6: pipelineOutput.neutralBackground6.fillColorRest,
    neutralBackgroundInverted: pipelineOutput.neutralBackgroundInverted.fillColorRest,
    neutralBackgroundDisabled: pipelineOutput.neutralBackgroundDisabled.fillColorRest,

    neutralStencil1: pipelineOutput.neutralStencil1.fillColorRest,
    neutralStencil2: pipelineOutput.neutralStencil2.fillColorRest,

    neutralStrokeAccessible: pipelineOutput.neutralStrokeAccessible.strokeColorRest,
    neutralStrokeAccessibleHover: pipelineOutput.neutralStrokeAccessible.strokeColorHover,
    neutralStrokeAccessiblePressed: pipelineOutput.neutralStrokeAccessible.strokeColorPressed,
    neutralStrokeAccessibleSelected: pipelineOutput.neutralStrokeAccessible.strokeColorSelected,

    neutralStroke1: pipelineOutput.neutralStroke1.strokeColorRest,
    neutralStroke1Hover: pipelineOutput.neutralStroke1.strokeColorHover,
    neutralStroke1Pressed: pipelineOutput.neutralStroke1.strokeColorPressed,
    neutralStroke1Selected: pipelineOutput.neutralStroke1.strokeColorSelected,

    neutralStroke2: pipelineOutput.neutralStroke2.strokeColorRest,
    neutralStrokeDisabled: pipelineOutput.neutralStrokeDisabled.strokeColorRest,

    //Brand tokens.
    brandBackground: pipelineOutput.brandBackground1.fillColorRest,
    brandBackgroundPressed: pipelineOutput.brandBackground1.fillColorPressed,
    brandBackgroundSelected: pipelineOutput.brandBackground1.fillColorSelected,
    brandBackgroundDisabled: pipelineOutput.brandBackgroundDisabled.fillColorRest,
    brandBackground2: pipelineOutput.brandBackground2?.fillColorRest,
    brandBackground2Pressed: pipelineOutput.brandBackground2?.fillColorPressed,
    brandBackground2Selected: pipelineOutput.brandBackground2?.fillColorSelected,

    brandBackground3: pipelineOutput.brandBackground3?.fillColorRest,
    brandBackgroundTint: pipelineOutput.brandBackgroundTint.fillColorRest,
    brandBackgroundInverted: pipelineOutput.brandBackgroundInverted.fillColorRest,

    brandBackgroundInvertedDisabled: pipelineOutput.brandBackgroundInvertedDisabled.fillColorRest,

    brandForeground1: pipelineOutput.brandForeground1.fillColorRest,
    brandForeground1Pressed: pipelineOutput.brandForeground1.fillColorPressed,
    brandForeground1Selected: pipelineOutput.brandForeground1.fillColorSelected,

    brandForegroundTint: pipelineOutput.brandForegroundTint.fillColorRest,
    brandForegroundDisabled1: pipelineOutput.brandForegroundDisabled1.fillColorRest,
    brandForegroundDisabled2: pipelineOutput.brandForegroundDisabled2.fillColorRest,

    brandStroke1: pipelineOutput.brandStroke1.strokeColorRest,
    brandStroke1Pressed: pipelineOutput.brandStroke1.strokeColorPressed,
    brandStroke1Selected: pipelineOutput.brandStroke1.strokeColorSelected,
  };
}

export function mapFontPipelineToTheme(pipelineOutput: any): Partial<Variants> {
  return {
    caption1: createVariantValue(pipelineOutput.caption1),
    caption2: createVariantValue(pipelineOutput.caption2),
    caption1Strong: createVariantValue(pipelineOutput.caption1Strong),
    body1: createVariantValue(pipelineOutput.body1),
    body1Strong: createVariantValue(pipelineOutput.body1Strong),
    body2: createVariantValue(pipelineOutput.body2),
    body2Strong: createVariantValue(pipelineOutput.body2Strong),
    title1: createVariantValue(pipelineOutput.title1),
    title2: createVariantValue(pipelineOutput.title2),
    title3: createVariantValue(pipelineOutput.title3),
    largeTitle: createVariantValue(pipelineOutput.largeTitle),
    display: createVariantValue(pipelineOutput.display),
  };
}

function createVariantValue(variant: any): VariantValue {
  return {
    face: variant.fontFamily,
    size: variant.fontSize,
    weight: variant.fontWeight,
    lineHeight: variant.fontLineHeight,
    letterSpacing: variant.fontLetterSpacing,
  };
}
