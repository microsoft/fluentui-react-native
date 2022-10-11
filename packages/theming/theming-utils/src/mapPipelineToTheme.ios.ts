import { Variants, VariantValue } from '@fluentui-react-native/theme-types';
import { FontStyleTokens } from '@fluentui-react-native/tokens';

export function mapFontPipelineToTheme(pipelineOutput: any): Partial<Variants> {
  return {
    caption2: convertAliasFont(pipelineOutput.caption2 as FontStyleTokens),
    caption1: convertAliasFont(pipelineOutput.caption1 as FontStyleTokens),
    caption1Strong: convertAliasFont(pipelineOutput.caption1Strong as FontStyleTokens),
    body2: convertAliasFont(pipelineOutput.body2 as FontStyleTokens),
    body2Strong: convertAliasFont(pipelineOutput.body2Strong as FontStyleTokens),
    body1: convertAliasFont(pipelineOutput.body1 as FontStyleTokens),
    body1Strong: convertAliasFont(pipelineOutput.body1Strong as FontStyleTokens),
    title3: convertAliasFont(pipelineOutput.title3 as FontStyleTokens),
    title2: convertAliasFont(pipelineOutput.title2 as FontStyleTokens),
    title1: convertAliasFont(pipelineOutput.title1 as FontStyleTokens),
    largeTitle: convertAliasFont(pipelineOutput.largeTitle as FontStyleTokens),
    display: convertAliasFont(pipelineOutput.display as FontStyleTokens),
  };
}

function convertAliasFont(aliasFont: FontStyleTokens): VariantValue {
  return {
    face: aliasFont.fontFamily,
    size: aliasFont.fontSize,
    weight: aliasFont.fontWeight,
    lineHeight: aliasFont.fontLineHeight,
    letterSpacing: aliasFont.fontLetterSpacing,
  };
}
