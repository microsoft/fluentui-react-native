import { createColorPinningTheme, resolveV0ColorTokens, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings } from './Checkbox.styling';
import { settings } from './deprecated/Checkbox.settings';

const theme = createColorPinningTheme();

describe('Checkbox color tokens', () => {
  it('pins v0 Checkbox color tokens', () => {
    expect(resolveV0ColorTokens(settings, theme)).toMatchSnapshot();
  });

  it('pins v1 Checkbox color tokens', () => {
    expect(resolveV1ColorTokens(stylingSettings.tokens, theme)).toMatchSnapshot();
  });
});
