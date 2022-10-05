import { AliasColorTokens, Variants } from '@fluentui-react-native/theme-types';

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
  };
}

export function mapFontPipelineToTheme(pipelineOutput: any): Partial<Variants> {
  return {
    caption1: createVariantValue(pipelineOutput.caption1),
    body1: createVariantValue(pipelineOutput.body1),
    body1Strong: createVariantValue(pipelineOutput.body1Strong),
    body2: createVariantValue(pipelineOutput.body2),
    body2Strong: createVariantValue(pipelineOutput.body2Strong),
    subtitle1: createVariantValue(pipelineOutput.subtitle1),
    subtitle1Strong: createVariantValue(pipelineOutput.subtitle1Strong),
    subtitle2: createVariantValue(pipelineOutput.subtitle2),
    subtitle2Strong: createVariantValue(pipelineOutput.subtitle2Strong),
    title1: createVariantValue(pipelineOutput.title1),
    title1Strong: createVariantValue(pipelineOutput.title1Strong),
    largeTitle: createVariantValue(pipelineOutput.largeTitle),
    display: createVariantValue(pipelineOutput.display),
  };
}

function createVariantValue(variant: any) {
  return { face: 'primary', size: variant.fontSize, weight: variant.fontWeight };
}
