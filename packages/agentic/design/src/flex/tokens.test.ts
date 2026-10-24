import { INTERACTIVE_COLOR_TOKENS, isInverseInteractionToken } from './colors/interactiveTokens';
import { defaultFlexTokenDescription, defaultFlexTokens, getDefaultFlexTokenDescription } from './defaults/defaultTokens';
import type { FlexTokenDescription, FlexTokens } from './tokens.types';

const flexTokens: FlexTokens = defaultFlexTokens;

function explicitStates(description: FlexTokenDescription): string[] {
  return Object.entries(description.color)
    .flatMap(([name, color]) =>
      (['hover', 'pressed'] as const).filter((state) => color[state] !== undefined).map((state) => `${name}.${state}`),
    )
    .sort();
}

describe('FlexTokens', () => {
  it('groups tokens and removes category prefixes from their names', () => {
    expect(flexTokens.color.surfaceNeutralFarther).toEqual({ rest: '#ebebeb', hover: '#e1e1e1', pressed: '#d7d7d7' });
    expect(flexTokens.shadow.lowest).toEqual([
      { x: 0, y: 0, blur: 2, color: '#0000001a' },
      { x: 0, y: 1, blur: 2, color: '#0000000d' },
    ]);
    expect(flexTokens.fontWeight.functionalRegular).toBe('400');
    expect(flexTokens.fontFamily.functional).toBeTruthy();
    expect(flexTokens.fontSize.functionalBodyMedium).toBe(14);
    expect(flexTokens.lineHeight.functionalBodyMedium).toBe(20);
    expect(flexTokens.borderRadius.base100).toBe(4);
    expect(flexTokens.spacing.componentBase800).toBe(32);
    expect(flexTokens.strokeWidth.thin).toBe(1);
    expect(flexTokens.motion.durationBase200).toBe(200);
    expect(flexTokens.motion.easingFunctionalEnter).toEqual([0, 0, 0, 1]);
    expect(flexTokens.color.backgroundBrandHeavy.rest).toBe('#242424');
  });

  it('does not expose the previous flat token names or state maps', () => {
    expect('colorSurfaceNeutralFarther' in flexTokens).toBe(false);
    expect('shadowLowest' in flexTokens).toBe(false);
    expect('fontWeightFunctionalRegular' in flexTokens).toBe(false);
    expect('hover' in flexTokens.color).toBe(false);
    expect('pressed' in flexTokens.color).toBe(false);
  });

  it('resolves every default color with all three states', () => {
    for (const [name, color] of Object.entries(defaultFlexTokens.color)) {
      expect([name, Object.keys(color)]).toEqual([name, ['rest', 'hover', 'pressed']]);
    }
    expect(defaultFlexTokens.color.fixedBlack.hover).toBe(defaultFlexTokens.color.fixedBlack.rest);
    expect(Object.isFrozen(defaultFlexTokens.color)).toBe(true);
  });

  it('authors inverse interaction metadata on every inverse interactive default', () => {
    for (const tone of ['cool', 'warm'] as const) {
      const colors = getDefaultFlexTokenDescription(tone).color;
      const inverted = Object.keys(colors).filter((name) => colors[name as keyof typeof colors].type === 'inverted');

      expect([tone, inverted.sort()]).toEqual([tone, INTERACTIVE_COLOR_TOKENS.filter(isInverseInteractionToken).sort()]);
    }
  });

  it('authors only the interaction states the policy cannot reproduce', () => {
    expect(explicitStates(defaultFlexTokenDescription)).toEqual([
      'backgroundNeutralTranslucent.hover',
      'backgroundNeutralTranslucent.pressed',
      'strokeBrandSoft.hover',
      'strokeBrandSoft.pressed',
      'strokeBrandSubtle.pressed',
      'strokeNeutralSoft.hover',
      'strokeNeutralSoft.pressed',
      'strokeNeutralSubtle.pressed',
    ]);
    expect(explicitStates(getDefaultFlexTokenDescription('warm'))).toEqual([]);
  });

  it('selects the default description by color tone', () => {
    const warm = getDefaultFlexTokenDescription('warm');

    expect(getDefaultFlexTokenDescription('cool')).toBe(defaultFlexTokenDescription);
    expect(getDefaultFlexTokenDescription('warm')).toBe(warm);
    expect(warm.color.surfaceNeutralFarther.rest).toEqual(['#f0eae5', '#1e1916']);
    expect(warm.shadow).toBe(defaultFlexTokenDescription.shadow);
  });
});
