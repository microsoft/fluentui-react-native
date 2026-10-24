import { INTERACTIVE_COLOR_TOKENS, isInverseInteractionToken } from './colors/interactiveTokens';
import { defaultFlexTokenDescription, defaultFlexTokens, nonFluentFlexTokens } from './defaults/defaultTokens';
import type { FlexTokens } from './tokens.types';

const flexTokens: FlexTokens = defaultFlexTokens;
const flexFromTheme = jest.requireActual<Record<string, string>>('../tokens/mappings/flex-from-theme.json');

function isColorOptions(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'rest' in value;
}

// Authored color paths: rest always, and hover or pressed only when explicit.
function getTokenPaths(tokens: object, colors: object): string[] {
  const colorPaths = Object.entries(colors).flatMap(([name, value]) => {
    const states = isColorOptions(value) ? ['rest', 'hover', 'pressed'].filter((state) => value[state] !== undefined) : ['rest'];
    return states.map((state) => `color.${name}.${state}`);
  });
  const groupPaths = Object.entries(tokens)
    .filter(([group]) => group !== 'color')
    .flatMap(([group, values]) => Object.keys(values).map((name) => `${group}.${name}`));

  return [...colorPaths, ...groupPaths].sort();
}

describe('FlexTokens', () => {
  it('groups tokens and removes category prefixes from their names', () => {
    expect(flexTokens.color.surfaceNeutralFarther).toEqual({ rest: '#ebebeb', hover: '#f5f5f5', pressed: '#f0f0f0' });
    expect(flexTokens.shadow.lowest.key.blur).toBe(2);
    expect(flexTokens.fontWeight.functionalRegular).toBe('400');
    expect(flexTokens.fontFamily.functional).toBeTruthy();
    expect(flexTokens.fontSize.functionalBodyMedium).toBeGreaterThan(0);
    expect(flexTokens.lineHeight.functionalBodyMedium).toBeGreaterThan(0);
    expect(flexTokens.borderRadius.base100).toBeGreaterThan(0);
    expect(flexTokens.spacing.componentBase100).toBeGreaterThan(0);
    expect(flexTokens.strokeWidth.thin).toBeGreaterThan(0);
    expect(flexTokens.color.backgroundBrandHeavy.rest).toBe('#185abd');
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

  it('authors inverse interaction metadata and explicit states on every interactive default', () => {
    const colors = defaultFlexTokenDescription.color;
    const inverted = Object.keys(colors).filter((name) => colors[name as keyof typeof colors].type === 'inverted');

    expect(inverted).toEqual(INTERACTIVE_COLOR_TOKENS.filter(isInverseInteractionToken));
    for (const token of INTERACTIVE_COLOR_TOKENS) {
      expect([token, colors[token].hover !== undefined, colors[token].pressed !== undefined]).toEqual([token, true, true]);
    }
  });

  it('builds defaults from values without FURN Theme sources', () => {
    const themeBackedPaths = new Set(Object.keys(flexFromTheme));
    const expectedNonFluentPaths = getTokenPaths(defaultFlexTokens, defaultFlexTokenDescription.color).filter((path) => {
      if (themeBackedPaths.has(path)) {
        return false;
      }

      const interactiveColor = /^color\.([^.]+)\.(?:hover|pressed)$/.exec(path);
      return !interactiveColor || !themeBackedPaths.has(`color.${interactiveColor[1]}.rest`);
    });

    expect(getTokenPaths(nonFluentFlexTokens, nonFluentFlexTokens.color)).toEqual(expectedNonFluentPaths);
    expect(Object.keys(nonFluentFlexTokens)).toEqual(['color', 'lineHeight', 'borderRadius', 'spacing', 'strokeWidth']);
    expect(nonFluentFlexTokens.color.backgroundNeutralSoft).toEqual({ rest: '#0000001a', hover: '#0000001a', pressed: '#0000001a' });
    expect(nonFluentFlexTokens.borderRadius.base100).toBe(2);
    expect('backgroundBrandHeavy' in nonFluentFlexTokens.color).toBe(false);
    expect('backgroundBrandSoft' in nonFluentFlexTokens.color).toBe(false);
    expect('surfaceNeutralFarther' in nonFluentFlexTokens.color).toBe(false);
    expect('base200' in nonFluentFlexTokens.borderRadius).toBe(false);
    expect(defaultFlexTokens.lineHeight).toBe(nonFluentFlexTokens.lineHeight);
    expect(defaultFlexTokens.color.backgroundNeutralSoft.rest).toBe(nonFluentFlexTokens.color.backgroundNeutralSoft.rest);
    expect(defaultFlexTokens.color.backgroundBrandHeavy.rest).toBe('#185abd');
    expect(defaultFlexTokens.color.backgroundBrandSoft.hover).toBe('#d2e0f4');
  });
});
