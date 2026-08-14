import { defaultFlexTokens, nonFluentFlexTokens } from './defaultTokens';
import type { FlexTokens, SemanticColorTokenValues } from './flex.types';

const colorTokens: SemanticColorTokenValues = defaultFlexTokens.color;
const flexTokens: FlexTokens = defaultFlexTokens;
const flexFromTheme = jest.requireActual<Record<string, string>>('./mappings/flex-from-theme.json');

function getTokenPaths(tokens: object, color: { hover: object; pressed: object }): string[] {
  const colorPaths = Object.keys(color)
    .filter((name) => name !== 'hover' && name !== 'pressed')
    .map((name) => `color.${name}`);
  const interactiveColorPaths = ['hover', 'pressed'].flatMap((state) => Object.keys(color[state]).map((name) => `color.${state}.${name}`));
  const groupPaths = Object.entries(tokens)
    .filter(([group]) => group !== 'color')
    .flatMap(([group, values]) => Object.keys(values).map((name) => `${group}.${name}`));

  return [...colorPaths, ...interactiveColorPaths, ...groupPaths].sort();
}

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

  it('builds defaults from values without FURN Theme sources', () => {
    const themeBackedPaths = new Set(Object.keys(flexFromTheme));
    const expectedNonFluentPaths = getTokenPaths(defaultFlexTokens, defaultFlexTokens.color).filter((path) => {
      if (themeBackedPaths.has(path)) {
        return false;
      }

      const interactiveColor = path.match(/^color\.(?:hover|pressed)\.(.+)$/);
      return !interactiveColor || !themeBackedPaths.has(`color.${interactiveColor[1]}`);
    });

    expect(getTokenPaths(nonFluentFlexTokens, nonFluentFlexTokens.color)).toEqual(expectedNonFluentPaths);
    expect(Object.keys(nonFluentFlexTokens)).toEqual(['color', 'lineHeight', 'borderRadius', 'spacing', 'strokeWidth']);
    expect(nonFluentFlexTokens.color.backgroundNeutralSoft).toBe('#0000001a');
    expect(nonFluentFlexTokens.color.hover.backgroundNeutralSoft).toBe('#0000001a');
    expect(nonFluentFlexTokens.borderRadius.base100).toBe(2);
    expect('backgroundBrandHeavy' in nonFluentFlexTokens.color).toBe(false);
    expect('backgroundBrandSoft' in nonFluentFlexTokens.color.hover).toBe(false);
    expect('surfaceNeutralFarther' in nonFluentFlexTokens.color.hover).toBe(false);
    expect('base200' in nonFluentFlexTokens.borderRadius).toBe(false);
    expect(defaultFlexTokens.lineHeight).toBe(nonFluentFlexTokens.lineHeight);
    expect(defaultFlexTokens.color.backgroundNeutralSoft).toBe(nonFluentFlexTokens.color.backgroundNeutralSoft);
    expect(defaultFlexTokens.color.backgroundBrandHeavy).toBe('#185abd');
    expect(defaultFlexTokens.color.hover.backgroundBrandSoft).toBe('#d2e0f4');
  });
});
