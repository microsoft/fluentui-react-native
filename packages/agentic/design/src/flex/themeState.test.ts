import { Appearance } from 'react-native';

import type { ThemeState } from './themeState.types';

describe('getDefaultThemeState', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['light', 'dark', null] as const)('resolves the Flex theme for system scheme %s only on first use', (colorScheme) => {
    jest.isolateModules(() => {
      const getColorScheme = jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(colorScheme);
      const { getDefaultThemeState } = require('./themeState') as typeof import('./themeState');
      const { flexCoolTheme } = require('../themes/flex/flexCoolTheme') as typeof import('../themes/flex/flexCoolTheme');
      const { resolveFlexTokenDescription } = require('./colors/interactionPolicy') as typeof import('./colors/interactionPolicy');
      expect(getColorScheme).not.toHaveBeenCalled();

      const state: ThemeState = getDefaultThemeState();
      expect(state.appearance).toEqual({
        colorScheme: colorScheme ?? 'light',
        contrast: 'standard',
        interfaceLevel: 'base',
        colorTone: 'cool',
      });
      const expected = resolveFlexTokenDescription(flexCoolTheme.tokens, state.appearance);
      expect(state.tokens.color.surfaceNeutralNear.rest).toBe(expected.color.surfaceNeutralNear.rest);
      expect(getColorScheme).toHaveBeenCalledTimes(1);

      getColorScheme.mockReturnValue(colorScheme === 'dark' ? 'light' : 'dark');
      expect(getDefaultThemeState()).toBe(state);
      expect(getColorScheme).toHaveBeenCalledTimes(1);
    });
  });
});
