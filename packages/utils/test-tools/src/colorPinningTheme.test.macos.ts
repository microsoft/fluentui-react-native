import { createColorPinningTheme } from './colorPinningTheme';

it('creates a macOS color pinning theme', () => {
  const theme = createColorPinningTheme();

  expect(Object.keys(theme.colors).length).toBeGreaterThan(0);
  expect(theme.host.appearance).toBe('dynamic');
  expect(theme.colors).toMatchObject({
    neutralForeground2: '#424242',
    neutralStroke1: '#d1d1d1',
    neutralBackground1Pressed: '#d6d6d6',
  });
});
