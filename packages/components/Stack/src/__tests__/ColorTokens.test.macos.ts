import { createColorPinningTheme, resolveV0ColorTokens } from '@fluentui-react-native/test-tools';

import { settings as stackSettings } from '../Stack.settings';
import { settings as stackItemSettings } from '../StackItem/StackItem.settings';

const theme = createColorPinningTheme();

describe('Stack color tokens', () => {
  it('pins Stack colors', () => {
    expect(resolveV0ColorTokens(stackSettings, theme)).toMatchSnapshot('Stack');
  });

  it('pins StackItem colors', () => {
    expect(resolveV0ColorTokens(stackItemSettings, theme)).toMatchSnapshot('StackItem');
  });
});
