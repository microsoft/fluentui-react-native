import { createColorPinningTheme, resolveV0ColorTokens, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings } from './Link.styling';
import { settings } from './legacy/Link.settings';

const theme = createColorPinningTheme();

describe('Link color tokens', () => {
  it('pins v0 Link color tokens', () => {
    expect(resolveV0ColorTokens(settings, theme)).toMatchSnapshot();
  });

  it('pins v1 Link color tokens', () => {
    expect(resolveV1ColorTokens(stylingSettings.tokens, theme)).toMatchSnapshot();
  });
});
