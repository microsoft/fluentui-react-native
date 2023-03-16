import type { ThemeOptions } from '@fluentui-react-native/theme-types';

import { getAndroidTheme } from '../androidTheme';
import { createAndroidTheme } from '../createAndroidTheme';

const defaultAppearance = 'light';
const themeOptions: ThemeOptions[][] = [
  [{ appearance: 'light', defaultAppearance: defaultAppearance }],
  [{ appearance: 'dark', defaultAppearance: defaultAppearance }],
  [{ appearance: 'darkElevated', defaultAppearance: defaultAppearance }],
  [{ appearance: 'highContrast', defaultAppearance: defaultAppearance }],
  [{ appearance: 'dynamic', defaultAppearance: defaultAppearance }],
];

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    getColorScheme: () => 'dark',
    addChangeListener: () => null,
  }));
});

it('getAndroidTheme light appearance test', () => {
  const lightTheme = getAndroidTheme('light');
  expect(lightTheme).toMatchSnapshot();
});

it('getAndroidTheme dark appearance test', () => {
  const darkTheme = getAndroidTheme('dark');
  expect(darkTheme).toMatchSnapshot();
});

it.concurrent.each(themeOptions)('createAndroidTheme test option %o', (option: ThemeOptions) => {
  const theme = createAndroidTheme(option).theme;
  expect(theme).toMatchSnapshot();
});
