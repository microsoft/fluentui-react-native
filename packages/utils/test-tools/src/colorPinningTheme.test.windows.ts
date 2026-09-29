import { createColorPinningTheme } from './colorPinningTheme';

it('creates an Office color pinning theme for Windows', () => {
  const theme = createColorPinningTheme();

  expect(Object.keys(theme.colors).length).toBeGreaterThan(0);
  expect(theme.host.appearance).toBe('light');
});
