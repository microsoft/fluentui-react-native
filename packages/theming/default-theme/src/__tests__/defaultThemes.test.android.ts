import { createDefaultTheme, defaultFluentDarkTheme, defaultFluentTheme } from '../index';

it('defaultFluentTheme', () => {
  expect(defaultFluentTheme).toMatchSnapshot();
});

it('defaultFluentDarkTheme', () => {
  expect(defaultFluentDarkTheme).toMatchSnapshot();
});

it.each(['light', 'dark'] as const)('high contrast %s theme', (colorScheme) => {
  const theme = createDefaultTheme({ appearance: 'highContrast' }).resolveTheme({
    colorScheme,
    contrast: 'highContrast',
    interfaceLevel: 'base',
  });
  expect(theme).toMatchSnapshot();
});
