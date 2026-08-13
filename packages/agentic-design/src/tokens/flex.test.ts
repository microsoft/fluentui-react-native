import { defaultFlexTokens } from './defaultTokens';
import type { FlexTokens, SemanticColorTokenValues } from './flex.types';

const colorTokens: SemanticColorTokenValues = defaultFlexTokens.color;
const flexTokens: FlexTokens = defaultFlexTokens;

describe('FlexTokens', () => {
  it('groups tokens and removes category prefixes from their names', () => {
    expect(flexTokens.color.surfaceNeutralFarther).toBe('#ebebeb');
    expect(flexTokens.color.hover.surfaceNeutralFarther).toBe('#f5f5f5');
    expect(flexTokens.color.pressed.surfaceNeutralFarther).toBe('#f0f0f0');
    expect(flexTokens.shadow.lowest.key.blur).toBe(2);
    expect(flexTokens.fontWeight.functionalRegular).toBe('400');
    expect(flexTokens.fontFamily.functional).toBeTruthy();
    expect(flexTokens.fontSize.functionalBodyMedium).toBeGreaterThan(0);
    expect(flexTokens.lineHeight.functionalBodyMedium).toBeGreaterThan(0);
    expect(flexTokens.borderRadius.base100).toBeGreaterThan(0);
    expect(flexTokens.spacing.componentBase100).toBeGreaterThan(0);
    expect(flexTokens.strokeWidth.thin).toBeGreaterThan(0);
    expect(colorTokens.backgroundBrandHeavy).toBe('#185abd');
  });

  it('does not expose the previous flat token names', () => {
    expect('colorSurfaceNeutralFarther' in flexTokens).toBe(false);
    expect('shadowLowest' in flexTokens).toBe(false);
    expect('fontWeightFunctionalRegular' in flexTokens).toBe(false);
  });
});
