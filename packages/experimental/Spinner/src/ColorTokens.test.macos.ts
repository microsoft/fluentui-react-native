import { createColorPinningTheme, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings } from './Spinner.styling';

it('pins Spinner color tokens on macOS', () => {
  const theme = createColorPinningTheme();

  expect(resolveV1ColorTokens(stylingSettings.tokens, theme)).toMatchSnapshot();
});
