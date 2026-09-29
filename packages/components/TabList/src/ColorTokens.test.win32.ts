import { createColorPinningTheme, getColorTokenSnapshot } from '@fluentui-react-native/test-tools';

import { useTabTokens } from './Tab/TabTokens';

const theme = createColorPinningTheme();

describe('TabList color tokens', () => {
  it('pins Tab colors', () => {
    const [tokens] = useTabTokens(theme);

    expect(getColorTokenSnapshot(tokens, theme)).toMatchSnapshot();
  });
});
