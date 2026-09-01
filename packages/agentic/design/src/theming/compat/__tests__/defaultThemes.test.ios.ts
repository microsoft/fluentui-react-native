import { defaultFluentTheme, defaultFluentDarkTheme, defaultFluentHighConstrastTheme } from '../defaultTheme';

it('defaultFluentTheme', () => {
  expect(defaultFluentTheme).toMatchSnapshot();
});

it('defaultFluentDarkTheme', () => {
  expect(defaultFluentDarkTheme).toMatchSnapshot();
});

it('defaultFluentHighConstrastTheme', () => {
  expect(defaultFluentHighConstrastTheme).toMatchSnapshot();
});
