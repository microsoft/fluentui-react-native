import type { Theme } from '../theming';
import { mockTheme } from '../testing/mockTheme';
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

    expect(tokens.color.backgroundNeutralSubtle).toBe('#223344');
    expect(tokens.color.hover.backgroundNeutralSubtle).toBe('#334455');
    expect(tokens.color.pressed.backgroundNeutralSubtle).toBe('#445566');
    expect(tokens.color.backgroundBrandSoft).toBe('#112233');
    expect(tokens.color.hover.backgroundBrandSoft).toBeUndefined();
    expect(tokens.color.pressed.backgroundBrandSoft).toBeUndefined();
    expect(tokens.color.backgroundNeutralSoft).toBe('#0000001a');
    expect(tokens.color.hover.backgroundNeutralSoft).toBe('#0000001a');
    expect(tokens.borderRadius.base100).toBe(2);
    expect(tokens.borderRadius.base200).toBe(10);
    expect(tokens.borderRadius.base300).toBe(10);
    expect(tokens.borderRadius.base400).toBe(6);
    expect(tokens.fontWeight.functionalMedium).toBe(theme.typography.weights.semiBold);
  });

  it('uses native defaults when an optional mapped Theme path is absent', () => {
    const tokens = flexTokensFromTheme({ ...createTheme(), components: {} });

    expect(tokens.borderRadius.base200).toBe(4);
    expect(tokens.borderRadius.base300).toBe(4);
    expect(tokens.color.backgroundBrandHeavy).toBe('#185abd');
  });
});
