import { AliasColorTokens } from '@fluentui-react-native/theme-types';

// API that translates tokens coming for android to Theme color values.
// This is implemented in a per-plaform fashion, for each endpoint that maps to similar token sets in design - i.e. map to similar
// pipeline output.
export function mapPipelineToTheme(pipelineOutput: any): AliasColorTokens {
  return {
    /// Neutral background tokens

    neutralBackground1: pipelineOutput.neutralBackground1.fillColorRest,
    neutralBackground1Pressed: pipelineOutput.neutralBackground1.fillColorPressed,
    neutralBackground1Selected: pipelineOutput.neutralBackground1.fillColorSelected,

    neutralBackground2: pipelineOutput.neutralBackground2.fillColorRest,
    neutralBackground2Pressed: pipelineOutput.neutralBackground2.fillColorPressed,
    neutralBackground2Selected: pipelineOutput.neutralBackground2.fillColorSelected,

    neutralBackground3: pipelineOutput.neutralBackground3.fillColorRest,
    neutralBackground3Pressed: pipelineOutput.neutralBackground3.fillColorPressed,
    neutralBackground3Selected: pipelineOutput.neutralBackground3.fillColorSelected,

    neutralBackground4: pipelineOutput.neutralBackground4.fillColorRest,
    neutralBackground4Pressed: pipelineOutput.neutralBackground4.fillColorPressed,
    neutralBackground4Selected: pipelineOutput.neutralBackground4.fillColorSelected,

    neutralBackground5: pipelineOutput.neutralBackground5.fillColorRest,
    neutralBackground5Pressed: pipelineOutput.neutralBackground5.fillColorPressed,
    neutralBackground5Selected: pipelineOutput.neutralBackground5.fillColorSelected,

    neutralBackground6: pipelineOutput.neutralBackground6.fillColorRest,

    neutralBackgroundCanvas: pipelineOutput.neutralBackgroundCanvas.fillColorRest,

    neutralBackgroundDarkStatic: pipelineOutput.neutralBackgroundDarkStatic.fillColorRest,

    neutralBackgroundLightStatic: pipelineOutput.neutralBackgroundLightStatic.fillColorRest,

    neutralBackgroundLightStaticDisabled: pipelineOutput.neutralBackgroundLightStaticDisabled.fillColorRest,

    neutralBackgroundInverted: pipelineOutput.neutralBackgroundInverted.fillColorRest,

    neutralBackgroundDisabled: pipelineOutput.neutralBackgroundDisabled.fillColorRest,

    neutralStencil1: pipelineOutput.neutralStencil1.fillColorRest,

    neutralStencil2: pipelineOutput.neutralStencil2.fillColorRest,

    /// Neutral foreground tokens

    neutralForeground1: pipelineOutput.neutralForeground1.fillColorRest,

    neutralForeground2: pipelineOutput.neutralForeground2.fillColorRest,

    neutralForeground3: pipelineOutput.neutralForeground3.fillColorRest,

    neutralForegroundDisabled1: pipelineOutput.neutralForegroundDisabled1.fillColorRest,

    neutralForegroundDisabled2: pipelineOutput.neutralForegroundDisabled2.fillColorRest,

    neutralForegroundOnColor: pipelineOutput.neutralForegroundOnColor.fillColorRest,

    neutralForegroundDarkStatic: pipelineOutput.neutralForegroundDarkStatic.fillColorRest,

    neutralForegroundLightStatic: pipelineOutput.neutralForegroundLightStatic.fillColorRest,

    /// Neutral stroke tokens

    neutralStroke1: pipelineOutput.neutralStroke1.strokeColorRest,

    neutralStroke2: pipelineOutput.neutralStroke2.strokeColorRest,

    neutralStrokeAccessible: pipelineOutput.neutralStrokeAccessible.strokeColorRest,

    neutralStrokeFocus1: pipelineOutput.neutralStrokeFocus1.strokeColorRest,

    neutralStrokeFocus2: pipelineOutput.neutralStrokeFocus2.strokeColorRest,

    neutralStrokeDisabled: pipelineOutput.neutralStrokeDisabled.strokeColorRest,

    /// Brand background tokens

    brandBackground: pipelineOutput.brandBackground1.fillColorRest,
    brandBackgroundPressed: pipelineOutput.brandBackground1.fillColorPressed,
    brandBackgroundSelected: pipelineOutput.brandBackground1.fillColorSelected,

    brandBackground2: pipelineOutput.brandBackground2?.fillColorRest,
    brandBackground2Pressed: pipelineOutput.brandBackground2?.fillColorPressed,
    brandBackground2Selected: pipelineOutput.brandBackground2?.fillColorSelected,

    brandBackground3: pipelineOutput.brandBackground3?.fillColorRest,

    brandBackgroundTint: pipelineOutput.brandBackgroundTint.fillColorRest,

    brandBackgroundDisabled: pipelineOutput.brandBackgroundDisabled.fillColorRest,

    /// Brand foreground tokens

    brandForeground1: pipelineOutput.brandForeground1.fillColorRest,
    brandForeground1Pressed: pipelineOutput.brandForeground1.fillColorPressed,
    brandForeground1Selected: pipelineOutput.brandForeground1.fillColorSelected,

    brandForegroundTint: pipelineOutput.brandForegroundTint.fillColorRest,

    brandForegroundDisabled1: pipelineOutput.brandForegroundDisabled1.fillColorRest,

    brandForegroundDisabled2: pipelineOutput.brandForegroundDisabled2.fillColorRest,

    /// Brand stroke tokens

    brandStroke1: pipelineOutput.brandStroke1.strokeColorRest,
    brandStroke1Pressed: pipelineOutput.brandStroke1.strokeColorPressed,
    brandStroke1Selected: pipelineOutput.brandStroke1.strokeColorSelected,
  };
}
