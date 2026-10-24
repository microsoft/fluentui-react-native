import { INTERACTIVE_COLOR_TOKENS } from '../colors/interactiveTokens';
import { fluentFallbackFlexTokens, nonFluentFlexTokens } from './fluentFallbackTokens';

const flexFromTheme = jest.requireActual<Record<string, string>>('../../tokens/mappings/flex-from-theme.json');
const interactiveTokens = new Set<string>(INTERACTIVE_COLOR_TOKENS);

function isColorOptions(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'rest' in value;
}

function getGroupPaths(tokens: object): string[] {
  return Object.entries(tokens)
    .filter(([group]) => group !== 'color')
    .flatMap(([group, values]) => Object.keys(values).map((name) => `${group}.${name}`));
}

// Authored color paths: rest always, and hover or pressed only when present.
function getAuthoredPaths(tokens: { color: object }): string[] {
  const colorPaths = Object.entries(tokens.color).flatMap(([name, value]) => {
    const states = isColorOptions(value) ? ['rest', 'hover', 'pressed'].filter((state) => value[state] !== undefined) : ['rest'];
    return states.map((state) => `color.${name}.${state}`);
  });
  return [...colorPaths, ...getGroupPaths(tokens)].sort();
}

// Every interactive fallback authors explicit states; other colors author rest only.
function getFallbackPaths(tokens: { color: object }): string[] {
  const colorPaths = Object.keys(tokens.color).flatMap((name) =>
    (interactiveTokens.has(name) ? ['rest', 'hover', 'pressed'] : ['rest']).map((state) => `color.${name}.${state}`),
  );
  return [...colorPaths, ...getGroupPaths(tokens)].sort();
}

describe('Fluent fallback Flex tokens', () => {
  it('builds fallbacks from values without FURN Theme sources', () => {
    const themeBackedPaths = new Set(Object.keys(flexFromTheme));
    const expectedNonFluentPaths = getFallbackPaths(fluentFallbackFlexTokens).filter((path) => {
      if (themeBackedPaths.has(path)) {
        return false;
      }

      const interactiveColor = /^color\.([^.]+)\.(?:hover|pressed)$/.exec(path);
      return !interactiveColor || !themeBackedPaths.has(`color.${interactiveColor[1]}.rest`);
    });

    expect(getAuthoredPaths(nonFluentFlexTokens)).toEqual(expectedNonFluentPaths);
    expect(Object.keys(nonFluentFlexTokens)).toEqual(['color', 'lineHeight', 'borderRadius', 'spacing', 'strokeWidth', 'motion']);
    expect(nonFluentFlexTokens.color.backgroundNeutralSoft).toEqual({ rest: '#0000001a', hover: '#0000001a', pressed: '#0000001a' });
    expect(nonFluentFlexTokens.borderRadius.base100).toBe(2);
    expect('backgroundBrandHeavy' in nonFluentFlexTokens.color).toBe(false);
    expect('backgroundBrandSoft' in nonFluentFlexTokens.color).toBe(false);
    expect('surfaceNeutralFarther' in nonFluentFlexTokens.color).toBe(false);
    expect('base200' in nonFluentFlexTokens.borderRadius).toBe(false);
    expect(fluentFallbackFlexTokens.lineHeight).toBe(nonFluentFlexTokens.lineHeight);
    expect(fluentFallbackFlexTokens.motion).toBe(nonFluentFlexTokens.motion);
    expect(fluentFallbackFlexTokens.color.backgroundNeutralSoft.rest).toBe(nonFluentFlexTokens.color.backgroundNeutralSoft.rest);
  });

  it('keeps the Fluent-native fallback values', () => {
    expect(fluentFallbackFlexTokens.color.surfaceNeutralFarther).toEqual({ rest: '#ebebeb', hover: '#f5f5f5', pressed: '#f0f0f0' });
    expect(fluentFallbackFlexTokens.color.backgroundBrandHeavy.rest).toBe('#185abd');
    expect(fluentFallbackFlexTokens.color.backgroundBrandSoft.hover).toBe('#d2e0f4');
    expect(fluentFallbackFlexTokens.spacing.componentBase800).toBe(32);
    expect(fluentFallbackFlexTokens.shadow.lowest).toEqual([
      { x: 0, y: 0, blur: 2, color: '#0000001f' },
      { x: 0, y: 1, blur: 2, color: '#00000024' },
    ]);
    expect(fluentFallbackFlexTokens.shadow.highest).toEqual([
      { x: 0, y: 0, blur: 8, color: '#00000033' },
      { x: 0, y: 32, blur: 64, color: '#0000003d' },
    ]);
  });
});
