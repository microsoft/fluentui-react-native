import * as React from 'react';
import { StyleSheet } from 'react-native';

import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { defaultResolvedThemeAppearance } from '../theming/appearance';
import type { ThemeAppearanceSource, ThemeAppearanceSourceSnapshot } from '../types/appearance.types';
import { ThemeContext } from '../theming/context';
import { FlexThemeReference } from './flexThemeReference';
import { ThemeProvider } from '../theming/ThemeProvider';
import type { Theme } from '../fluent/types/Theme.types';
import { mockTheme } from '../test/fixtures/mockTheme';
import { themedStyleSheetFactory, useThemeAppearance, useThemeState } from './useThemeState';
import type { ThemeState } from '../types/themeState.types';

function ThemeStateProbe({ states }: { states: ThemeState[] }) {
  states.push(useThemeState());
  return null;
}

function ThemeAppearanceProbe({ states }: { states: ReturnType<typeof useThemeAppearance>[] }) {
  states.push(useThemeAppearance());
  return null;
}

function createContextTheme(background: string, appearance: Theme['host']['appearance'] = 'light'): Theme {
  return {
    ...mockTheme,
    colors: {
      ...mockTheme.colors,
      neutralBackground2: background,
    },
    components: {},
    host: {
      ...mockTheme.host,
      appearance,
    },
  };
}

const lightAppearanceSnapshot = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const;
const lightAppearanceSource: ThemeAppearanceSource = {
  getSnapshot: () => lightAppearanceSnapshot,
  subscribe: () => () => undefined,
};

function createMutableAppearanceSource() {
  let snapshot: ThemeAppearanceSourceSnapshot = {
    colorScheme: 'light',
    contrast: 'standard',
    interfaceLevel: 'base',
  };
  const listeners = new Set<() => void>();
  return {
    source: {
      getSnapshot: () => snapshot,
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    } satisfies ThemeAppearanceSource,
    setColorScheme(colorScheme: 'light' | 'dark') {
      snapshot = { ...snapshot, colorScheme };
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

describe('useThemeState', () => {
  it('shares lazily created theme style sheets between component instances', () => {
    const states: ThemeState[] = [];
    let component: ReactTestRenderer;
    act(() => {
      component = create(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(ThemeStateProbe, { states }),
          React.createElement(ThemeStateProbe, { states }),
        ),
      );
    });

    let createCount = 0;
    const getStyles = themedStyleSheetFactory('test.styles', ({ tokens }) => {
      createCount += 1;
      return StyleSheet.create({
        root: {
          backgroundColor: tokens.color.backgroundNeutralSubtle.rest,
        },
      });
    });

    expect(states).toHaveLength(2);
    expect(states[0]).toBe(states[1]);
    expect(getStyles(states[0])).toBe(getStyles(states[1]));
    expect(createCount).toBe(1);

    act(() => component!.unmount());
  });

  it('creates a typed style getter with an isolated cache key', () => {
    const states: ThemeState[] = [];
    let component: ReactTestRenderer;
    act(() => {
      component = create(React.createElement(ThemeStateProbe, { states }));
    });

    let createCount = 0;
    const getStyles = themedStyleSheetFactory('test.styles', ({ tokens }) => {
      createCount += 1;
      return StyleSheet.create({
        root: {
          backgroundColor: tokens.color.backgroundNeutralSubtle.rest,
        },
      });
    });

    const first = getStyles(states[0]);
    const second = getStyles(states[0]);

    expect(first).toBe(second);
    expect(first.root.backgroundColor).toBe(states[0].tokens.color.backgroundNeutralSubtle.rest);
    expect(createCount).toBe(1);
    act(() => component!.unmount());
  });

  it('creates one ThemeState per context Theme without mutating the Theme', () => {
    const theme = Object.freeze(createContextTheme('#123456', 'highContrast'));
    const initialSymbols = Object.getOwnPropertySymbols(theme);
    const states: ThemeState[] = [];
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeContext.Provider,
          { value: theme },
          React.createElement(
            React.Fragment,
            null,
            React.createElement(ThemeStateProbe, { states }),
            React.createElement(ThemeStateProbe, { states }),
          ),
        ),
      );
    });

    expect(states).toHaveLength(2);
    expect(states[0]).toBe(states[1]);
    expect(states[0].tokens.color.backgroundNeutralSubtle.rest).toBe('#123456');
    expect(states[0].highContrast).toBe(true);
    expect(states[0].appearance.contrast).toBe('highContrast');
    expect(states[0].appearance.colorTone).toBe('cool');

    expect(Object.getOwnPropertySymbols(theme)).toEqual(initialSymbols);

    act(() => component!.unmount());
    act(() => {
      component = create(React.createElement(ThemeContext.Provider, { value: theme }, React.createElement(ThemeStateProbe, { states })));
    });

    expect(states[2]).toBe(states[0]);
    act(() => component!.unmount());
  });

  it('creates a distinct ThemeState for a different context Theme', () => {
    const states: ThemeState[] = [];
    const firstTheme = createContextTheme('#111111');
    const secondTheme = createContextTheme('#222222');
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(ThemeContext.Provider, { value: firstTheme }, React.createElement(ThemeStateProbe, { states })),
      );
    });
    act(() => {
      component!.update(
        React.createElement(ThemeContext.Provider, { value: secondTheme }, React.createElement(ThemeStateProbe, { states })),
      );
    });

    expect(states[1]).not.toBe(states[0]);
    expect(states[1].tokens.color.backgroundNeutralSubtle.rest).toBe('#222222');
    act(() => component!.unmount());
  });

  it('does not resolve a Flex source until useThemeState is consumed', () => {
    const resolver = jest.fn(() => ({ color: { backgroundBrandHeavy: '#123456' } }));
    const reference = new FlexThemeReference({ base: resolver });
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(React.Fragment),
        ),
      );
    });
    expect(resolver).not.toHaveBeenCalled();

    const states: ThemeState[] = [];
    act(() => {
      component!.update(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(ThemeStateProbe, { states }),
        ),
      );
    });

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(states[0].tokens.color.backgroundBrandHeavy.rest).toBe('#123456');
    expect(states[0].appearance).toBe(defaultResolvedThemeAppearance);
    act(() => component!.unmount());
  });

  it('shares one state for a Flex source and resolved appearance', () => {
    const reference = new FlexThemeReference();
    const states: ThemeState[] = [];
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(
            React.Fragment,
            null,
            React.createElement(ThemeStateProbe, { states }),
            React.createElement(ThemeStateProbe, { states }),
          ),
        ),
      );
    });

    expect(states[0]).toBe(states[1]);
    expect(states[0].tokens).toBe(states[1].tokens);
    act(() => component!.unmount());
  });

  it('keys ThemeState by resolved appearance and reuses it when toggling back', () => {
    const reference = new FlexThemeReference();
    const appearanceSource = createMutableAppearanceSource();
    const states: ThemeState[] = [];
    const appearanceStates: ReturnType<typeof useThemeAppearance>[] = [];
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: appearanceSource.source },
          React.createElement(
            React.Fragment,
            null,
            React.createElement(ThemeStateProbe, { states }),
            React.createElement(ThemeAppearanceProbe, { states: appearanceStates }),
          ),
        ),
      );
    });
    const lightState = states.at(-1);

    act(() => appearanceSource.setColorScheme('dark'));
    const darkState = states.at(-1);
    expect(darkState).not.toBe(lightState);
    expect(darkState?.appearance.colorScheme).toBe('dark');

    act(() => appearanceSource.setColorScheme('light'));
    expect(states.at(-1)).toBe(lightState);
    expect(appearanceStates.at(-1)?.requested.colorScheme).toBe('system');
    act(() => component!.unmount());
  });

  it('keys ThemeState and theme styles by color tone', () => {
    const reference = new FlexThemeReference();
    const states: ThemeState[] = [];
    const render = (colorTone: 'cool' | 'warm') =>
      React.createElement(
        ThemeProvider,
        { theme: reference, appearanceSource: lightAppearanceSource, appearance: { colorTone } },
        React.createElement(ThemeStateProbe, { states }),
      );
    let createCount = 0;
    const getStyles = themedStyleSheetFactory('test.tone', ({ appearance }) => {
      createCount += 1;
      return { root: { opacity: appearance.colorTone === 'warm' ? 0.5 : 1 } };
    });
    let component: ReactTestRenderer;

    act(() => {
      component = create(render('cool'));
    });
    const coolState = states.at(-1)!;
    act(() => component!.update(render('warm')));
    const warmState = states.at(-1)!;

    expect(warmState).not.toBe(coolState);
    expect(warmState.appearance).toMatchObject({ colorScheme: 'light', colorTone: 'warm' });
    expect(warmState.themeStyles).not.toBe(coolState.themeStyles);
    expect(getStyles(coolState).root.opacity).toBe(1);
    expect(getStyles(warmState).root.opacity).toBe(0.5);

    act(() => component!.update(render('cool')));
    expect(states.at(-1)).toBe(coolState);
    expect(getStyles(coolState).root.opacity).toBe(1);
    expect(createCount).toBe(2);
    act(() => component!.unmount());
  });

  it('replaces ThemeState after source invalidation', () => {
    const reference = new FlexThemeReference();
    const states: ThemeState[] = [];
    let component: ReactTestRenderer;

    act(() => {
      component = create(
        React.createElement(
          ThemeProvider,
          { theme: reference, appearanceSource: lightAppearanceSource },
          React.createElement(ThemeStateProbe, { states }),
        ),
      );
    });
    const initialState = states.at(-1);

    act(() => reference.invalidate());

    expect(states.at(-1)).not.toBe(initialState);
    expect(states.at(-1)?.tokens).not.toBe(initialState?.tokens);
    act(() => component!.unmount());
  });
});
