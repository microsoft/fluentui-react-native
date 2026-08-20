import * as React from 'react';
import { StyleSheet } from 'react-native';

import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { ThemeContext } from './theming/context';
import type { Theme } from './theming/types/Theme.types';
import { mockTheme } from './testing/mockTheme';
import { themedStyleSheetFactory, useThemeState } from './useThemeState';
import type { ThemeState } from './useThemeState';

function ThemeStateProbe({ states }: { states: ThemeState[] }) {
  states.push(useThemeState());
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
          backgroundColor: tokens.color.backgroundNeutralSubtle,
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
          backgroundColor: tokens.color.backgroundNeutralSubtle,
        },
      });
    });

    const first = getStyles(states[0]);
    const second = getStyles(states[0]);

    expect(first).toBe(second);
    expect(first.root.backgroundColor).toBe(states[0].tokens.color.backgroundNeutralSubtle);
    expect(createCount).toBe(1);
    act(() => component!.unmount());
  });

  it('creates one ThemeState per context Theme and stores it on the Theme', () => {
    const theme = createContextTheme('#123456', 'highContrast');
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
    expect(states[0].tokens.color.backgroundNeutralSubtle).toBe('#123456');
    expect(states[0].highContrast).toBe(true);

    const stateSymbol = Object.getOwnPropertySymbols(theme).find((symbol) => !initialSymbols.includes(symbol));
    expect(stateSymbol).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(theme, stateSymbol!)?.enumerable).toBe(false);

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
    expect(states[1].tokens.color.backgroundNeutralSubtle).toBe('#222222');
    act(() => component!.unmount());
  });
});
