import { createColorPinningTheme, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings } from './Avatar.styling';

it('pins Avatar color tokens on macOS', () => {
  const theme = createColorPinningTheme();

  expect(resolveV1ColorTokens(stylingSettings.tokens, theme)).toMatchSnapshot();
});
