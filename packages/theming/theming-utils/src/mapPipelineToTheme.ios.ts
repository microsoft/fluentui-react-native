import type { AliasColorTokens, FontDynamicTypeRamp, Variants, VariantValue } from '@fluentui-react-native/theme-types';
import type { FontStyleTokens } from '@fluentui-react-native/tokens';

// API that maps tokens coming from the iOS token pipeline to Theme color values.
export function mapPipelineToTheme(pipelineOutput: any): AliasColorTokens {
  return {
    /// Neutral background tokens

    neutralBackground1: pipelineOutput.neutralBackground1.rest,
    neutralBackground1Pressed: pipelineOutput.neutralBackground1.pressed,
    neutralBackground1Selected: pipelineOutput.neutralBackground1.selected,

    neutralBackground2: pipelineOutput.neutralBackground2.rest,
    neutralBackground2Pressed: pipelineOutput.neutralBackground2.pressed,
    neutralBackground2Selected: pipelineOutput.neutralBackground2.selected,

    neutralBackground3: pipelineOutput.neutralBackground3.rest,
    neutralBackground3Pressed: pipelineOutput.neutralBackground3.pressed,
    neutralBackground3Selected: pipelineOutput.neutralBackground3.selected,

    neutralBackground4: pipelineOutput.neutralBackground4.rest,
    neutralBackground4Pressed: pipelineOutput.neutralBackground4.pressed,
    neutralBackground4Selected: pipelineOutput.neutralBackground4.selected,

    neutralBackground5: pipelineOutput.neutralBackground5.rest,
    neutralBackground5Pressed: pipelineOutput.neutralBackground5.pressed,
    neutralBackground5Selected: pipelineOutput.neutralBackground5.selected,

    neutralBackground6: pipelineOutput.neutralBackground6.rest,

    neutralBackgroundCanvas: pipelineOutput.neutralBackgroundCanvas.rest,

    neutralBackgroundDarkStatic: pipelineOutput.neutralBackgroundDarkStatic.rest,

    neutralBackgroundLightStatic: pipelineOutput.neutralBackgroundLightStatic.rest,

    neutralBackgroundLightStaticDisabled: pipelineOutput.neutralBackgroundLightStaticDisabled.rest,

    neutralBackgroundInverted: pipelineOutput.neutralBackgroundInverted.rest,

    neutralBackgroundDisabled: pipelineOutput.neutralBackgroundDisabled.rest,

    neutralStencil1: pipelineOutput.neutralStencil1.rest,

    neutralStencil2: pipelineOutput.neutralStencil2.rest,

    /// Neutral foreground tokens

    neutralForeground1: pipelineOutput.neutralForeground1.rest,

    neutralForeground2: pipelineOutput.neutralForeground2.rest,

    neutralForeground3: pipelineOutput.neutralForeground3.rest,

    neutralForegroundDisabled1: pipelineOutput.neutralForegroundDisabled1.rest,

    neutralForegroundDisabled2: pipelineOutput.neutralForegroundDisabled2.rest,

    neutralForegroundOnColor: pipelineOutput.neutralForegroundOnColor.rest,

    neutralForegroundDarkStatic: pipelineOutput.neutralForegroundDarkStatic.rest,

    neutralForegroundLightStatic: pipelineOutput.neutralForegroundLightStatic.rest,

    /// Neutral stroke tokens

    neutralStroke1: pipelineOutput.neutralStroke1.rest,

    neutralStroke2: pipelineOutput.neutralStroke2.rest,

    neutralStrokeAccessible: pipelineOutput.neutralStrokeAccessible.rest,

    neutralStrokeFocus1: pipelineOutput.neutralStrokeFocus1.rest,

    neutralStrokeFocus2: pipelineOutput.neutralStrokeFocus2.rest,

    neutralStrokeDisabled: pipelineOutput.neutralStrokeDisabled.rest,

    /// Brand background tokens

    brandBackground: pipelineOutput.brandBackground1.rest,
    brandBackgroundPressed: pipelineOutput.brandBackground1.pressed,
    brandBackgroundSelected: pipelineOutput.brandBackground1.selected,

    brandBackground2: pipelineOutput.brandBackground2?.rest,
    brandBackground2Pressed: pipelineOutput.brandBackground2?.pressed,
    brandBackground2Selected: pipelineOutput.brandBackground2?.selected,

    brandBackground3: pipelineOutput.brandBackground3?.rest,

    brandBackgroundTint: pipelineOutput.brandBackgroundTint.rest,

    brandBackgroundDisabled: pipelineOutput.brandBackgroundDisabled.rest,

    /// Brand foreground tokens

    brandForeground1: pipelineOutput.brandForeground1.rest,
    brandForeground1Pressed: pipelineOutput.brandForeground1.pressed,
    brandForeground1Selected: pipelineOutput.brandForeground1.selected,

    brandForegroundTint: pipelineOutput.brandForegroundTint.rest,

    brandForegroundDisabled1: pipelineOutput.brandForegroundDisabled1.rest,

    brandForegroundDisabled2: pipelineOutput.brandForegroundDisabled2.rest,

    /// Brand stroke tokens

    brandStroke1: pipelineOutput.brandStroke1.rest,
    brandStroke1Pressed: pipelineOutput.brandStroke1.pressed,
    brandStroke1Selected: pipelineOutput.brandStroke1.selected,
    brandStrokeTint: pipelineOutput.brandStrokeTint.rest,

    /// Error, status, and presence tokens

    dangerBackground1: pipelineOutput.dangerBackground1.rest,
    dangerBackground2: pipelineOutput.dangerBackground2.rest,
    dangerForeground1: pipelineOutput.dangerForeground1.rest,
    dangerForeground2: pipelineOutput.dangerForeground2.rest,
    dangerStroke1: pipelineOutput.dangerStroke1.rest,

    successBackground1: pipelineOutput.successBackground1.rest,
    successBackground2: pipelineOutput.successBackground2.rest,
    successForeground1: pipelineOutput.successForeground1.rest,
    successForeground2: pipelineOutput.successForeground2.rest,
    successStroke1: pipelineOutput.successStroke1.rest,

    warningBackground1: pipelineOutput.warningBackground1.rest,
    warningBackground2: pipelineOutput.warningBackground2.rest,
    warningForeground1: pipelineOutput.warningForeground1.rest,
    warningForeground2: pipelineOutput.warningForeground2.rest,
    warningStroke1: pipelineOutput.warningStroke1.rest,

    severeBackground1: pipelineOutput.severeBackground1.rest,
    severeBackground2: pipelineOutput.severeBackground2.rest,
    severeForeground1: pipelineOutput.severeForeground1.rest,
    severeForeground2: pipelineOutput.severeForeground2.rest,
    severeStroke1: pipelineOutput.severeStroke1.rest,

    presenceAway: pipelineOutput.presenceAway.rest,
    presenceDnd: pipelineOutput.presenceDnd.rest,
    presenceAvailable: pipelineOutput.presenceAvailable.rest,
    presenceOof: pipelineOutput.presenceOof.rest,
  };
}

export function mapFontPipelineToTheme(pipelineOutput: any): Partial<Variants> {
  return {
    caption2: convertAliasFont(pipelineOutput.caption2 as FontStyleTokens, 'caption1'),
    caption1: convertAliasFont(pipelineOutput.caption1 as FontStyleTokens, 'footnote'),
    caption1Strong: convertAliasFont(pipelineOutput.caption1Strong as FontStyleTokens, 'footnote'),
    body2: convertAliasFont(pipelineOutput.body2 as FontStyleTokens, 'subheadline'),
    body2Strong: convertAliasFont(pipelineOutput.body2Strong as FontStyleTokens, 'subheadline'),
    body1: convertAliasFont(pipelineOutput.body1 as FontStyleTokens, 'body'),
    body1Strong: convertAliasFont(pipelineOutput.body1Strong as FontStyleTokens, 'body'),
    title3: convertAliasFont(pipelineOutput.title3 as FontStyleTokens, 'title3'),
    title2: convertAliasFont(pipelineOutput.title2 as FontStyleTokens, 'title2'),
    title1: convertAliasFont(pipelineOutput.title1 as FontStyleTokens, 'title1'),
    largeTitle: convertAliasFont(pipelineOutput.largeTitle as FontStyleTokens, 'largeTitle'),
    display: convertAliasFont(pipelineOutput.display as FontStyleTokens, 'largeTitle'),
  };
}

// TODO: Dynamic Type ramps should eventually be pulled from the pipeline
function convertAliasFont(aliasFont: FontStyleTokens, dynamicTypeRamp: FontDynamicTypeRamp): VariantValue {
  return {
    face: aliasFont.fontFamily,
    size: aliasFont.fontSize,
    weight: aliasFont.fontWeight,
    lineHeight: aliasFont.fontLineHeight,
    letterSpacing: aliasFont.fontLetterSpacing,
    dynamicTypeRamp,
  };
}
