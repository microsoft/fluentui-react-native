import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/src/Shadow.types';

/**
 * Given design token pipeline output for shadow tokens, creates an object that can be used in Theme object.
 * @param pipelineOutputShadow Assumes that this is the object in the tokens-shadow.json file of the pipeline output
 * @returns Object containing shadow tokens
 */
export function mapPipelineToShadow(pipelineOutputShadow: any): ThemeShadowDefinition {
  return {
    shadow2: { ambient: pipelineOutputShadow.shadow2[0], key: pipelineOutputShadow.shadow2[1] },
    shadow4: { ambient: pipelineOutputShadow.shadow4[0], key: pipelineOutputShadow.shadow4[1] },
    shadow8: { ambient: pipelineOutputShadow.shadow8[0], key: pipelineOutputShadow.shadow8[1] },
    shadow16: { ambient: pipelineOutputShadow.shadow16[0], key: pipelineOutputShadow.shadow16[1] },
    shadow28: { ambient: pipelineOutputShadow.shadow28[0], key: pipelineOutputShadow.shadow28[1] },
    shadow64: { ambient: pipelineOutputShadow.shadow64[0], key: pipelineOutputShadow.shadow64[1] },
    shadow2brand: { ambient: pipelineOutputShadow.shadowBrand2[0], key: pipelineOutputShadow.shadowBrand2[1] },
    shadow4brand: { ambient: pipelineOutputShadow.shadowBrand4[0], key: pipelineOutputShadow.shadowBrand4[1] },
    shadow8brand: { ambient: pipelineOutputShadow.shadowBrand8[0], key: pipelineOutputShadow.shadowBrand8[1] },
    shadow16brand: { ambient: pipelineOutputShadow.shadowBrand16[0], key: pipelineOutputShadow.shadowBrand16[1] },
    shadow28brand: { ambient: pipelineOutputShadow.shadowBrand28[0], key: pipelineOutputShadow.shadowBrand28[1] },
    shadow64brand: { ambient: pipelineOutputShadow.shadowBrand64[0], key: pipelineOutputShadow.shadowBrand64[1] },
  };
}
