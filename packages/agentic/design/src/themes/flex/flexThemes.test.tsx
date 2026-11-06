import { act, create } from 'react-test-renderer';

import { FlexThemeReference } from '../../flex/flexThemeReference';
import type { ThemeState } from '../../flex/themeState.types';
import { useThemeState } from '../../flex/useThemeState';
import { ThemeProvider } from '../../theming/ThemeProvider';
import type { ColorTone } from '../../types/appearance.types';
import { flexCoolTheme, flexTheme, flexWarmTheme } from '../index';

describe('Flex themes', () => {
  it.each([
    ['flexCoolTheme', flexCoolTheme, 'cool'],
    ['flexWarmTheme', flexWarmTheme, 'warm'],
  ] as const)('%s reproduces the package defaults for its tone in light and dark', (_name, theme, colorTone) => {
    const reference = new FlexThemeReference({ base: theme });
    const defaults = new FlexThemeReference();

    for (const colorScheme of ['light', 'dark'] as const) {
      const appearance = { colorScheme, contrast: 'standard', interfaceLevel: 'base', colorTone } as const;
      expect(reference.resolveFlexTokens(appearance)).toEqual(defaults.resolveFlexTokens(appearance));
    }
  });

  it.each(['light', 'dark'] as const)('switches flexTheme palettes with the requested tone in %s mode', (colorScheme) => {
    const reference = new FlexThemeReference({ base: flexTheme });
    const coolReference = new FlexThemeReference({ base: flexCoolTheme });
    const warmReference = new FlexThemeReference({ base: flexWarmTheme });
    const seen: ThemeState[] = [];
    const Probe = () => {
      seen.push(useThemeState());
      return null;
    };
    const render = (colorTone: ColorTone) => (
      <ThemeProvider theme={reference} appearance={{ colorScheme, colorTone }}>
        <Probe />
      </ThemeProvider>
    );
    let component!: ReturnType<typeof create>;

    act(() => {
      component = create(render('cool'));
    });
    const coolState = seen.at(-1)!;
    expect(coolState.tokens).toEqual(coolReference.resolveFlexTokens(coolState.appearance));

    act(() => component.update(render('warm')));
    const warmState = seen.at(-1)!;
    expect(warmState.tokens).toEqual(warmReference.resolveFlexTokens(warmState.appearance));
    expect(warmState.tokens.color.surfaceNeutralNear.rest).not.toBe(coolState.tokens.color.surfaceNeutralNear.rest);
    expect(warmState.themeStyles).not.toBe(coolState.themeStyles);

    act(() => component.update(render('cool')));
    expect(seen.at(-1)).toBe(coolState);
    act(() => component.unmount());
  });

  it('makes a reference built on flexWarmTheme warm until a provider requests another tone', () => {
    const reference = new FlexThemeReference({ base: flexWarmTheme });
    const seen: ThemeState[] = [];
    const Probe = () => {
      seen.push(useThemeState());
      return null;
    };
    const render = (colorTone?: ColorTone) => (
      <ThemeProvider theme={reference} appearance={colorTone ? { colorScheme: 'light', colorTone } : { colorScheme: 'light' }}>
        <Probe />
      </ThemeProvider>
    );
    let component!: ReturnType<typeof create>;

    act(() => {
      component = create(render());
    });
    expect(seen.at(-1)?.appearance.colorTone).toBe('warm');
    expect(seen.at(-1)?.tokens.color.surfaceNeutralFarther.rest).toBe('#f0eae5');

    act(() => component.update(render('cool')));
    expect(seen.at(-1)?.appearance.colorTone).toBe('cool');
    expect(seen.at(-1)?.tokens.color.surfaceNeutralFarther.rest).toBe('#f0eae5');

    act(() => component.unmount());
  });
});
