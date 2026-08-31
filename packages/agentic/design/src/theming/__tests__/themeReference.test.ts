import { mockTheme } from '../../testing';
import type { Theme, Spacing, PartialTheme } from '../index';

import { defaultResolvedThemeAppearance } from '../appearance';
import { ThemeReference } from '../themeReference';

const themeBase = mockTheme;

describe('ThemeReference tests', () => {
  it('returns a flat wrapped theme', () => {
    const ref = new ThemeReference(themeBase);
    expect(ref.theme).toEqual(themeBase);
  });

  it('creates a consistent new object', () => {
    const themeRef = new ThemeReference(themeBase, { colors: { white: 'pink' } });
    expect(themeRef.theme).toBe(themeRef.theme);
    expect(themeRef.theme).not.toBe(themeBase);
  });

  it('resolves stable appearance-specific roots', () => {
    const themeRef = new ThemeReference(themeBase);
    const light = themeRef.resolveTheme(defaultResolvedThemeAppearance);
    const dark = themeRef.resolveTheme({
      colorScheme: 'dark',
      contrast: 'standard',
      interfaceLevel: 'base',
    });

    expect(themeRef.resolveTheme(defaultResolvedThemeAppearance)).toBe(light);
    expect(dark).not.toBe(light);
    expect(light).not.toBe(themeBase);
  });

  it('replaces resolved roots and increments revision after invalidation', () => {
    const themeRef = new ThemeReference(themeBase);
    const before = themeRef.resolveTheme(defaultResolvedThemeAppearance);

    themeRef.invalidate();

    expect(themeRef.revision).toBe(1);
    expect(themeRef.resolveTheme(defaultResolvedThemeAppearance)).not.toBe(before);
  });

  it('performs a simple merge', () => {
    const themeRef = new ThemeReference(themeBase, {
      colors: {
        white: 'pink',
      },
      spacing: { l2: '120px' } as Partial<Spacing>,
    });
    expect(themeRef.theme.colors.white).toEqual('pink');
    expect(themeRef.theme.spacing.l2).toEqual('120px');
  });

  it('transforms via functions correctly', () => {
    const themeRef = new ThemeReference(themeBase, () => ({
      colors: {
        white: 'blue',
      },
    }));
    expect(themeRef.theme.colors.white).toEqual('blue');
  });

  it('handles multiple recipes for a single reference', () => {
    const themeRef = new ThemeReference<Theme, PartialTheme>(themeBase, { colors: { white: 'black' } }, () => ({
      colors: { red: 'green' },
    }));
    expect(themeRef.theme.colors.white).toEqual('black');
    expect(themeRef.theme.colors.red).toEqual('green');
  });

  it('sends updates correctly', () => {
    const themeRef = new ThemeReference(themeBase);
    const signal = { count: 0 };
    const onChange = () => {
      signal.count++;
    };
    themeRef.addOnThemeChanged(onChange);
    expect(signal.count).toEqual(0);
    themeRef.invalidate();
    expect(signal.count).toEqual(1);
    themeRef.removeOnThemeChanged(onChange);
    themeRef.invalidate();
    expect(signal.count).toEqual(1);
  });

  it('chains correctly for definitions and updates', () => {
    const baseRef = new ThemeReference<Theme, PartialTheme>(themeBase, { colors: { white: 'pink' } });
    const nextRef = new ThemeReference(baseRef, { colors: { red: 'purple' } });
    const signal = { count: 0 };
    const onChange = () => {
      signal.count++;
    };
    nextRef.addOnThemeChanged(onChange);
    expect(nextRef.theme.colors.white).toEqual('pink');
    expect(nextRef.theme.colors.red).toEqual('purple');
    expect(signal.count).toEqual(0);
    baseRef.update({ colors: { white: 'blue' } });
    expect(signal.count).toEqual(1);
    expect(nextRef.theme.colors.white).toEqual('blue');
  });

  it('scopes dynamic appearance subscriptions to active listeners', () => {
    let snapshot: { colorScheme: 'light' | 'dark' } = { colorScheme: 'light' };
    const unsubscribeAppearance = jest.fn();
    const appearanceSource = {
      getSnapshot: () => snapshot,
      subscribe: jest.fn(() => unsubscribeAppearance),
    };
    const recipe = jest.fn((_theme: Theme, appearance) => ({
      host: { appearance: appearance?.colorScheme },
    }));
    const themeRef = new ThemeReference({
      base: themeBase,
      appearance: { colorScheme: 'system' },
      appearanceSource,
      recipes: [recipe],
    });

    expect(themeRef.theme.host.appearance).toBe('light');
    expect(appearanceSource.subscribe).not.toHaveBeenCalled();

    snapshot = { colorScheme: 'dark' };
    expect(themeRef.theme.host.appearance).toBe('dark');

    const listener = jest.fn();
    themeRef.addOnThemeChanged(listener);
    expect(appearanceSource.subscribe).toHaveBeenCalledTimes(1);
    themeRef.removeOnThemeChanged(listener);
    expect(unsubscribeAppearance).toHaveBeenCalledTimes(1);
  });

  it('can observe a source for non-appearance theme updates with an explicit appearance', () => {
    const unsubscribeAppearance = jest.fn();
    const appearanceSource = {
      getSnapshot: () => ({ colorScheme: 'light' as const }),
      subscribe: jest.fn(() => unsubscribeAppearance),
    };
    const themeRef = new ThemeReference({
      base: themeBase,
      appearance: { colorScheme: 'light' },
      appearanceSource,
      alwaysSubscribeToAppearanceSource: true,
    });
    const listener = jest.fn();

    themeRef.addOnThemeChanged(listener);
    expect(appearanceSource.subscribe).toHaveBeenCalledTimes(1);
    themeRef.removeOnThemeChanged(listener);
    expect(unsubscribeAppearance).toHaveBeenCalledTimes(1);
  });

  it('preserves child revision and cached appearances for parent appearance-only events', () => {
    const appearanceListeners = new Set<() => void>();
    const appearanceSource = {
      getSnapshot: () => ({ colorScheme: 'light' as const }),
      subscribe: (listener: () => void) => {
        appearanceListeners.add(listener);
        return () => appearanceListeners.delete(listener);
      },
    };
    const parent = new ThemeReference({
      base: themeBase,
      appearance: { colorScheme: 'system' },
      appearanceSource,
    });
    const child = new ThemeReference(parent);
    const listener = jest.fn();
    child.addOnThemeChanged(listener);
    const lightTheme = child.resolveTheme(defaultResolvedThemeAppearance);

    for (const appearanceListener of appearanceListeners) {
      appearanceListener();
    }

    expect(parent.revision).toBe(0);
    expect(child.revision).toBe(0);
    expect(child.resolveTheme(defaultResolvedThemeAppearance)).toBe(lightTheme);
    expect(listener).toHaveBeenCalled();
  });
});
