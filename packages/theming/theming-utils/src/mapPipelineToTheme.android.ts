import type { AliasColorTokens, Variants, VariantValue } from '@fluentui-react-native/theme-types';

// API that maps tokens coming from the android token pipeline to Theme color values.
export function mapPipelineToTheme(pipelineOutput: any): AliasColorTokens {
  return {
    neutralForeground1: pipelineOutput.neutralForeground1.rest,
    neutralForeground1Hover: pipelineOutput.neutralForeground1.hover,
    neutralForeground1Pressed: pipelineOutput.neutralForeground1.pressed,
    neutralForeground1Selected: pipelineOutput.neutralForeground1.selected,
    neutralForeground2: pipelineOutput.neutralForeground2.rest,
    neutralForeground2Hover: pipelineOutput.neutralForeground2.hover,
    neutralForeground2Pressed: pipelineOutput.neutralForeground2.pressed,
    neutralForeground2Selected: pipelineOutput.neutralForeground2.selected,
    neutralForeground2BrandHover: pipelineOutput.neutralForeground2.brandHover,
    neutralForeground2BrandPressed: pipelineOutput.neutralForeground2.brandPressed,
    neutralForeground2BrandSelected: pipelineOutput.neutralForeground2.brandSelected,
    neutralForeground3: pipelineOutput.neutralForeground3.rest,
    neutralForeground3Hover: pipelineOutput.neutralForeground3.hover,
    neutralForeground3Pressed: pipelineOutput.neutralForeground3.pressed,
    neutralForeground3Selected: pipelineOutput.neutralForeground3.selected,
    neutralForeground3BrandHover: pipelineOutput.neutralForeground3.brandHover,
    neutralForeground3BrandPressed: pipelineOutput.neutralForeground3.brandPressed,
    neutralForeground3BrandSelected: pipelineOutput.neutralForeground3.brandSelected,
    neutralForegroundInverted: pipelineOutput.neutralForegroundInverted.rest,
    neutralForegroundDisabled1: pipelineOutput.neutralForegroundDisabled1.rest,
    neutralForegroundDisabled2: pipelineOutput.neutralForegroundDisabled2.rest,

    neutralForegroundOnColor: pipelineOutput.neutralForegroundOnColor.rest,

    neutralBackgroundLightStatic: pipelineOutput.neutralBackgroundLightStatic.rest,
    neutralBackgroundLightStaticDisabled: pipelineOutput.neutralBackgroundLightStaticDisabled.rest,

    neutralBackground1: pipelineOutput.neutralBackground1.rest,
    neutralBackground1Hover: pipelineOutput.neutralBackground1.hover,
    neutralBackground1Pressed: pipelineOutput.neutralBackground1.pressed,
    neutralBackground1Selected: pipelineOutput.neutralBackground1.selected,
    neutralBackground2: pipelineOutput.neutralBackground2.rest,
    neutralBackground2Hover: pipelineOutput.neutralBackground2.hover,
    neutralBackground2Pressed: pipelineOutput.neutralBackground2.pressed,
    neutralBackground2Selected: pipelineOutput.neutralBackground2.selected,

    neutralBackground3: pipelineOutput.neutralBackground3.rest,
    neutralBackground3Hover: pipelineOutput.neutralBackground3.hover,
    neutralBackground3Pressed: pipelineOutput.neutralBackground3.pressed,
    neutralBackground3Selected: pipelineOutput.neutralBackground3.selected,

    neutralBackground4: pipelineOutput.neutralBackground4.rest,
    neutralBackground4Hover: pipelineOutput.neutralBackground4.hover,
    neutralBackground4Pressed: pipelineOutput.neutralBackground4.pressed,
    neutralBackground4Selected: pipelineOutput.neutralBackground4.selected,

    neutralBackground5: pipelineOutput.neutralBackground5.rest,
    neutralBackground5Hover: pipelineOutput.neutralBackground5.hover,
    neutralBackground5Pressed: pipelineOutput.neutralBackground5.pressed,
    neutralBackground5Selected: pipelineOutput.neutralBackground5.selected,

    neutralBackground6: pipelineOutput.neutralBackground6.rest,
    neutralBackgroundInverted: pipelineOutput.neutralBackgroundInverted.rest,
    neutralBackgroundDisabled: pipelineOutput.neutralBackgroundDisabled.rest,
    neutralBackgroundCanvas: pipelineOutput.neutralBackgroundCanvas.rest,
    neutralBackgroundDarkStatic: pipelineOutput.neutralBackgroundDarkStatic.rest,

    neutralStencil1: pipelineOutput.neutralStencil1.rest,
    neutralStencil2: pipelineOutput.neutralStencil2.rest,

    neutralStrokeAccessible: pipelineOutput.neutralStrokeAccessible.rest,
    neutralStrokeAccessibleHover: pipelineOutput.neutralStrokeAccessible.hover,
    neutralStrokeAccessiblePressed: pipelineOutput.neutralStrokeAccessible.pressed,
    neutralStrokeAccessibleSelected: pipelineOutput.neutralStrokeAccessible.selected,

    neutralStroke1: pipelineOutput.neutralStroke1.rest,
    neutralStroke1Hover: pipelineOutput.neutralStroke1.hover,
    neutralStrokeFocus1: pipelineOutput.neutralStrokeFocus1.rest,
    neutralStrokeFocus2: pipelineOutput.neutralStrokeFocus2.rest,
    neutralStroke1Pressed: pipelineOutput.neutralStroke1.pressed,
    neutralStroke1Selected: pipelineOutput.neutralStroke1.selected,

    neutralStroke2: pipelineOutput.neutralStroke2.rest,
    neutralStrokeDisabled: pipelineOutput.neutralStrokeDisabled.rest,

    //Brand tokens.
    brandBackground: pipelineOutput.brandBackground1.rest,
    brandBackgroundPressed: pipelineOutput.brandBackground1.pressed,
    brandBackgroundSelected: pipelineOutput.brandBackground1.selected,
    brandBackgroundDisabled: pipelineOutput.brandBackgroundDisabled.rest,
    brandBackground2: pipelineOutput.brandBackground2?.rest,
    brandBackground2Pressed: pipelineOutput.brandBackground2?.pressed,
    brandBackground2Selected: pipelineOutput.brandBackground2?.selected,

    brandBackground3: pipelineOutput.brandBackground3?.rest,
    brandBackgroundTint: pipelineOutput.brandBackgroundTint.rest,
    brandBackgroundInverted: pipelineOutput.brandBackgroundInverted.rest,

    brandBackgroundInvertedDisabled: pipelineOutput.brandBackgroundInvertedDisabled.rest,

    brandForeground1: pipelineOutput.brandForeground1.rest,
    brandForeground1Pressed: pipelineOutput.brandForeground1.pressed,
    brandForeground1Selected: pipelineOutput.brandForeground1.selected,

    brandForegroundTint: pipelineOutput.brandForegroundTint.rest,
    brandForegroundDisabled1: pipelineOutput.brandForegroundDisabled1.rest,
    brandForegroundDisabled2: pipelineOutput.brandForegroundDisabled2.rest,

    brandStroke1: pipelineOutput.brandStroke1.rest,
    brandStroke1Pressed: pipelineOutput.brandStroke1.pressed,
    brandStroke1Selected: pipelineOutput.brandStroke1.selected,

    /// Error, status, and presence tokens

    dangerBackground1: pipelineOutput.dangerBackground1.rest,
    dangerBackground2: pipelineOutput.dangerBackground2.rest,
    dangerForeground1: pipelineOutput.dangerForeground1.rest,
    dangerForeground2: pipelineOutput.dangerForeground2.rest,

    successBackground1: pipelineOutput.successBackground1.rest,
    successBackground2: pipelineOutput.successBackground2.rest,
    successForeground1: pipelineOutput.successForeground1.rest,
    successForeground2: pipelineOutput.successForeground2.rest,

    warningBackground1: pipelineOutput.warningBackground1.rest,
    warningBackground2: pipelineOutput.warningBackground2.rest,
    warningForeground1: pipelineOutput.warningForeground1.rest,
    warningForeground2: pipelineOutput.warningForeground2.rest,

    severeBackground1: pipelineOutput.severeBackground1.rest,
    severeBackground2: pipelineOutput.severeBackground2.rest,
    severeForeground1: pipelineOutput.severeForeground1.rest,
    severeForeground2: pipelineOutput.severeForeground1.rest,

    presenceAway: pipelineOutput.presenceAway.rest,
    presenceDnd: pipelineOutput.presenceDnd.rest,
    presenceAvailable: pipelineOutput.presenceAvailable.rest,
    presenceOof: pipelineOutput.presenceOof.rest,
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
