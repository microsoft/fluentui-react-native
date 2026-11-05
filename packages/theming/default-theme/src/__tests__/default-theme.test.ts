import type { ThemeOptions } from '@fluentui-react-native/design/theming';

import { createDefaultTheme, defaultFluentTheme, defaultFluentDarkTheme } from '../index';

const defaultThemeOptions: ThemeOptions[][] = [
  [{ appearance: 'light', defaultAppearance: 'light' }],
  [{ appearance: 'dark', defaultAppearance: 'light' }],
  [{ appearance: 'highContrast', defaultAppearance: 'light' }],
  [{ appearance: undefined, defaultAppearance: 'light' }],
  [{ appearance: 'dynamic', defaultAppearance: 'light' }],
];

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    getColorScheme: () => 'dark',
    addChangeListener: () => null,
  }));
});

it('defaultFluentTheme test', () => {
  expect(defaultFluentTheme).toMatchSnapshot();
});

it('defaultFluentDarkTheme test', () => {
  expect(defaultFluentDarkTheme).toMatchSnapshot();
});

describe('createDefaultTheme test', () => {
  it.concurrent.each(defaultThemeOptions)('themeOption - %o', async (themeOption: ThemeOptions) => {
    const defaultTheme = createDefaultTheme(themeOption).theme;
    expect(defaultTheme).toMatchSnapshot();
  });

  it('resolves mutable compatibility options again after invalidation', () => {
    const options: ThemeOptions = { appearance: 'light' };
    const reference = createDefaultTheme(options);
    expect(reference.theme.host.appearance).toBe('light');

    options.appearance = 'dark';
    reference.invalidate();

    expect(reference.theme.host.appearance).toBe('dark');
  });

  it('resolves mutable default appearance options again after invalidation', () => {
    const options: ThemeOptions = { defaultAppearance: 'light' };
    const reference = createDefaultTheme(options);
    expect(reference.theme.host.appearance).toBe('light');

    options.defaultAppearance = 'dark';
    reference.invalidate();

    expect(reference.theme.host.appearance).toBe('dark');
  });
});
