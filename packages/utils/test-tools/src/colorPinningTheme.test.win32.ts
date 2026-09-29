import { createColorPinningTheme } from './colorPinningTheme';

it('creates a Win32 color pinning theme', () => {
  const theme = createColorPinningTheme();

  expect(Object.keys(theme.colors).length).toBeGreaterThan(0);
  expect(theme.host.appearance).toBe('light');
});
