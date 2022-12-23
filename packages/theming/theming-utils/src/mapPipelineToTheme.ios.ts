import { Variants, VariantValue } from '@fluentui-react-native/theme-types';
import { FontStyleTokens } from '@fluentui-react-native/tokens';

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
function convertAliasFont(aliasFont: FontStyleTokens, dynamicTypeRamp: string): VariantValue {
  return {
    face: aliasFont.fontFamily,
    size: aliasFont.fontSize,
    weight: aliasFont.fontWeight,
    lineHeight: aliasFont.fontLineHeight,
    letterSpacing: aliasFont.fontLetterSpacing,
    dynamicTypeRamp,
  };
}
