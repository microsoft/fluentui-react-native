import * as React from 'react';
import { StyleSheet } from 'react-native';

import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { getThemeStyleSheet, useThemeState } from './useThemeState';
import type { ThemeState } from './useThemeState';

function ThemeStateProbe({ states }: { states: ThemeState[] }) {
  states.push(useThemeState());
  return null;
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

    const styleKey = Symbol('test.styles');
    let createCount = 0;
    const getStyles = (themeState: ThemeState) =>
      getThemeStyleSheet(themeState, styleKey, ({ tokens }) => {
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

    delete states[0].themeStyles[styleKey];
    act(() => component!.unmount());
  });
});
