import type { ButtonTokens, FABTokens } from '@fluentui-react-native/button';
import type { ThemeOptions } from '@fluentui-react-native/theme-types';

import { getAndroidTheme } from '../androidTheme';
import { defaultButtonColorTokens } from '../components/Button/ButtonColorTokens';
import { defaultButtonFontTokens } from '../components/Button/ButtonFontTokens';
import { defaultButtonTokens } from '../components/Button/ButtonTokens';
import { defaultFABColorTokens } from '../components/Button/FABColorTokens';
import { defaultFABTokens } from '../components/Button/FABTokens';
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

describe('verify types', () => {
  it('Button types', () => {
    const officeTheme = getAndroidTheme('light');
    const colorTokens: ButtonTokens = defaultButtonColorTokens(officeTheme);
    expect(colorTokens).toBeTruthy();
    const fontTokens: ButtonTokens = defaultButtonFontTokens(officeTheme);
    expect(fontTokens).toBeTruthy();
    const tokens: ButtonTokens = defaultButtonTokens(officeTheme);
    expect(tokens).toBeTruthy();

    const fabTokens: FABTokens = defaultFABTokens(officeTheme);
    expect(fabTokens).toBeTruthy();
    const fabColorTokens: FABTokens = defaultFABColorTokens(officeTheme);
    expect(fabColorTokens).toBeTruthy();
  });
});
