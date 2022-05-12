import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/src/Shadow.types';

export function mapPipelineToShadow(pipelineOutput: any): ThemeShadowDefinition {
  return {
    shadow2: { ambient: pipelineOutput.shadow[2][0], key: pipelineOutput.shadow[2][1] },
    shadow4: { ambient: pipelineOutput.shadow[4][0], key: pipelineOutput.shadow[4][1] },
    shadow8: { ambient: pipelineOutput.shadow[8][0], key: pipelineOutput.shadow[8][1] },
    shadow16: { ambient: pipelineOutput.shadow[16][0], key: pipelineOutput.shadow[16][1] },
    shadow28: { ambient: pipelineOutput.shadow[28][0], key: pipelineOutput.shadow[28][1] },
    shadow64: { ambient: pipelineOutput.shadow[64][0], key: pipelineOutput.shadow[64][1] },
    shadow2brand: { ambient: pipelineOutput.shadow.brand2[0], key: pipelineOutput.shadow.brand2[1] },
    shadow4brand: { ambient: pipelineOutput.shadow.brand4[0], key: pipelineOutput.shadow.brand4[1] },
    shadow8brand: { ambient: pipelineOutput.shadow.brand8[0], key: pipelineOutput.shadow.brand8[1] },
    shadow16brand: { ambient: pipelineOutput.shadow.brand16[0], key: pipelineOutput.shadow.brand16[1] },
    shadow28brand: { ambient: pipelineOutput.shadow.brand28[0], key: pipelineOutput.shadow.brand28[1] },
    shadow64brand: { ambient: pipelineOutput.shadow.brand64[0], key: pipelineOutput.shadow.brand64[1] },
  };
}
