import { createAndroidTheme } from '../createAndroidTheme';
import { getAndroidTheme } from '../androidTheme';
import { ThemeOptions } from '@fluentui-react-native/theme-types';

const defaultAppearance = 'light';

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    getColorScheme: () => 'dark',
    addChangeListener: () => null,
  }));
});

const themeOptions: ThemeOptions[][] = [
  [{ appearance: 'light', defaultAppearance: defaultAppearance }],
  [{ appearance: 'dark', defaultAppearance: defaultAppearance }],
  [{ appearance: 'highContrast', defaultAppearance: defaultAppearance }],
  [{ appearance: 'dynamic', defaultAppearance: defaultAppearance }],
];

it('getAndroidTheme light appearance test', () => {
  const lightTheme = getAndroidTheme('light');
  expect(lightTheme).toMatchSnapshot();
});

it('getAndroidTheme dark appearance test', () => {
  const darkTheme = getAndroidTheme('dark');
  expect(darkTheme).toMatchSnapshot();
});

it.concurrent.each(themeOptions)('createAndroidTheme test', (option: ThemeOptions) => {
  const theme = createAndroidTheme(option).theme;
  expect(theme).toMatchSnapshot();
});
