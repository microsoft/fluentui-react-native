import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/src/Shadow.types';

/**
 * Given design token pipeline output for shadow tokens, creates an object that can be used in Theme object.
 * @param pipelineOutputShadow Assumes that this is the object at the shadow property of the pipeline output
 * @returns Object containing shadow tokens
 */
export function mapPipelineToShadow(pipelineOutputShadow: any): ThemeShadowDefinition {
  return {
    shadow2: { ambient: pipelineOutputShadow[2][0], key: pipelineOutputShadow[2][1] },
    shadow4: { ambient: pipelineOutputShadow[4][0], key: pipelineOutputShadow[4][1] },
    shadow8: { ambient: pipelineOutputShadow[8][0], key: pipelineOutputShadow[8][1] },
    shadow16: { ambient: pipelineOutputShadow[16][0], key: pipelineOutputShadow[16][1] },
    shadow28: { ambient: pipelineOutputShadow[28][0], key: pipelineOutputShadow[28][1] },
    shadow64: { ambient: pipelineOutputShadow[64][0], key: pipelineOutputShadow[64][1] },
    shadow2brand: { ambient: pipelineOutputShadow.brand[2][0], key: pipelineOutputShadow.brand[2][1] },
    shadow4brand: { ambient: pipelineOutputShadow.brand[4][0], key: pipelineOutputShadow.brand[4][1] },
    shadow8brand: { ambient: pipelineOutputShadow.brand[8][0], key: pipelineOutputShadow.brand[8][1] },
    shadow16brand: { ambient: pipelineOutputShadow.brand[16][0], key: pipelineOutputShadow.brand[16][1] },
    shadow28brand: { ambient: pipelineOutputShadow.brand[28][0], key: pipelineOutputShadow.brand[28][1] },
    shadow64brand: { ambient: pipelineOutputShadow.brand[64][0], key: pipelineOutputShadow.brand[64][1] },
  };
}
