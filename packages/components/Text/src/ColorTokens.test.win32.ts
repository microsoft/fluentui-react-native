import { createColorPinningTheme, getColorTokenSnapshot, resolveV0ColorTokens } from '@fluentui-react-native/test-tools';

import { useTextTokens } from './TextTokens';
import { settings } from './deprecated/Text.settings';

const theme = createColorPinningTheme();

describe('Text color tokens', () => {
  it('pins v0 Text color tokens', () => {
    expect(resolveV0ColorTokens(settings, theme)).toMatchSnapshot();
  });

  it('pins v1 Text color tokens', () => {
    const [tokens] = useTextTokens(theme);
    expect(getColorTokenSnapshot(tokens, theme)).toMatchSnapshot();
  });
});
