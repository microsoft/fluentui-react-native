import * as interaction from '../../color-lib/interaction';
import type { Theme } from '../../theming';
import { mockTheme } from '../../test/fixtures/mockTheme';
import { defaultFlexTokens } from '../defaults/defaultTokens';
import { fluentFallbackFlexTokens } from './fluentFallbackTokens';
import { flexTokensFromTheme } from './flexTokensFromTheme';

function createTheme(): Theme {
  return {
    ...mockTheme,
    colors: {
      ...mockTheme.colors,
      brandBackground2: '#112233',
      neutralBackground2: '#223344',
      neutralBackground2Hover: '#334455',
      neutralBackground2Pressed: '#445566',
    },
    components: {
      Button: {
        tokens: {
          borderRadius: 10,
        },
      },
    },
  };
}

describe('flexTokensFromTheme', () => {
  it('merges mapped Theme values over non-Fluent defaults', () => {
    const theme = createTheme();
    const tokens = flexTokensFromTheme(theme);

    expect(tokens.color.backgroundNeutralSubtle).toEqual({ rest: '#223344', hover: '#334455', pressed: '#445566' });
    expect(tokens.color.backgroundBrandSoft).toEqual({ rest: '#112233', hover: '#112233', pressed: '#112233' });
    expect(tokens.color.backgroundNeutralSoft).toEqual({ rest: '#0000001a', hover: '#0000001a', pressed: '#0000001a' });
    expect(tokens.color.expressionAccentHeavy).toEqual({ rest: '#242424', hover: '#242424', pressed: '#242424' });
    expect(tokens.fontWeight.functionalMedium).toBe(theme.typography.weights.semiBold);
  });

  it('keeps Flex border radius independent of the Theme Button radius', () => {
    const flexRadius = { base100: 4, base200: 8, base300: 12, base400: 16, base600: 24, base700: 28, circular: 9999 };

    expect(flexTokensFromTheme(createTheme()).borderRadius).toEqual(flexRadius);
    expect(flexTokensFromTheme({ ...createTheme(), components: {} }).borderRadius).toEqual(flexRadius);
    expect(defaultFlexTokens.borderRadius).toEqual(flexRadius);
  });

  it('converts legacy { ambient, key } Theme shadows to [ambient, key] layers', () => {
    const tokens = flexTokensFromTheme(createTheme());

    expect(tokens.shadow.lowest).toEqual([mockTheme.shadows.shadow2.ambient, mockTheme.shadows.shadow2.key]);
    expect(tokens.shadow.highest).toEqual([mockTheme.shadows.shadow64.ambient, mockTheme.shadows.shadow64.key]);
  });

  it('keeps layered shadows and drops missing legacy layers', () => {
    const layers = [mockTheme.shadows.shadow4.key, mockTheme.shadows.shadow8.key, mockTheme.shadows.shadow16.key];
    const shadows = { ...mockTheme.shadows, shadow4: layers, shadow8: { ambient: mockTheme.shadows.shadow8.ambient } };
    const tokens = flexTokensFromTheme({ ...createTheme(), shadows } as unknown as Theme);

    expect(tokens.shadow.lower).toBe(layers);
    expect(tokens.shadow.low).toEqual([mockTheme.shadows.shadow8.ambient]);
  });

  it('uses the Fluent fallback shadow when the Theme omits one', () => {
    const { shadow2: _omitted, ...shadows } = mockTheme.shadows;
    const tokens = flexTokensFromTheme({ ...createTheme(), shadows } as Theme);

    expect(tokens.shadow.lowest).toEqual(fluentFallbackFlexTokens.shadow.lowest);
  });

  it('resolves every color and never runs the interaction engine', () => {
    const spy = jest.spyOn(interaction, 'getInteractionColor');
    try {
      const tokens = flexTokensFromTheme(createTheme(), { colorScheme: 'dark' });
      for (const color of Object.values(tokens.color)) {
        void color.hover;
        void color.pressed;
      }

      expect(spy).not.toHaveBeenCalled();
      expect(Object.isFrozen(tokens)).toBe(true);
      expect(Object.isFrozen(tokens.color)).toBe(true);
      expect(Object.keys(tokens.color).sort()).toEqual(Object.keys(defaultFlexTokens.color).sort());
    } finally {
      spy.mockRestore();
    }
  });
});
