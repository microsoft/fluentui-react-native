import { createAndroidTheme } from '../createAndroidTheme';
import { getAndroidTheme } from '../androidTheme';

it('getAndroidTheme light appearance test', () => {
  const lightTheme = getAndroidTheme('light');
  expect(lightTheme).toMatchSnapshot();
});

it('getAndroidTheme dark appearance test', () => {
  const darkTheme = getAndroidTheme('dark');
  expect(darkTheme).toMatchSnapshot();
});

// it('createAndroidTheme test');
