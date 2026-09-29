import { createColorPinningTheme, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings } from './Drawer.styling';

it('pins Drawer color tokens on Win32', () => {
  const theme = createColorPinningTheme();

  expect(resolveV1ColorTokens(stylingSettings.tokens, theme)).toMatchSnapshot();
});
