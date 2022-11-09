import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/src/Shadow.types';

/**
 * Given design token pipeline output for shadow tokens, creates an object that can be used in Theme object.
 * @param pipelineOutputShadow Assumes that this is the object in the tokens-shadow.json file of the pipeline output
 * @returns Object containing shadow tokens
 */
export function mapPipelineToShadow(pipelineOutputShadow: any): ThemeShadowDefinition {
  return {
    shadow2: { ambient: pipelineOutputShadow.global.shadow2[0], key: pipelineOutputShadow.global.shadow2[1] },
    shadow4: { ambient: pipelineOutputShadow.global.shadow4[0], key: pipelineOutputShadow.global.shadow4[1] },
    shadow8: { ambient: pipelineOutputShadow.global.shadow8[0], key: pipelineOutputShadow.global.shadow8[1] },
    shadow16: { ambient: pipelineOutputShadow.global.shadow16[0], key: pipelineOutputShadow.global.shadow16[1] },
    shadow28: { ambient: pipelineOutputShadow.global.shadow28[0], key: pipelineOutputShadow.global.shadow28[1] },
    shadow64: { ambient: pipelineOutputShadow.global.shadow64[0], key: pipelineOutputShadow.global.shadow64[1] },
    shadow2brand: { ambient: pipelineOutputShadow.global.shadowBrand2[0], key: pipelineOutputShadow.global.shadowBrand2[1] },
    shadow4brand: { ambient: pipelineOutputShadow.global.shadowBrand4[0], key: pipelineOutputShadow.global.shadowBrand4[1] },
    shadow8brand: { ambient: pipelineOutputShadow.global.shadowBrand8[0], key: pipelineOutputShadow.global.shadowBrand8[1] },
    shadow16brand: { ambient: pipelineOutputShadow.global.shadowBrand16[0], key: pipelineOutputShadow.global.shadowBrand16[1] },
    shadow28brand: { ambient: pipelineOutputShadow.global.shadowBrand28[0], key: pipelineOutputShadow.global.shadowBrand28[1] },
    shadow64brand: { ambient: pipelineOutputShadow.global.shadowBrand64[0], key: pipelineOutputShadow.global.shadowBrand64[1] },
  };
}
