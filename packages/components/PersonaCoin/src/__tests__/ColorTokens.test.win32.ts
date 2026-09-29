import { createColorPinningTheme, resolveV0ColorTokens } from '@fluentui-react-native/test-tools';

import { settings } from '../PersonaCoin.settings';

const theme = createColorPinningTheme();

describe('PersonaCoin color tokens', () => {
  it('pins PersonaCoin colors', () => {
    expect(resolveV0ColorTokens(settings, theme)).toMatchSnapshot('PersonaCoin');
  });
});
