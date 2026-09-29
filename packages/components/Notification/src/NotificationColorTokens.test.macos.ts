import { createColorPinningTheme, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings } from './Notification.styling';

it('pins Notification color tokens on macOS', () => {
  const theme = createColorPinningTheme();

  expect(resolveV1ColorTokens(stylingSettings.tokens, theme)).toMatchSnapshot();
});
