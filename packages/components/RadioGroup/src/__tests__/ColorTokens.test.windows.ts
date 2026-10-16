import { createColorPinningTheme, resolveV0ColorTokens, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings as radioStylingSettings } from '../Radio/Radio.styling';
import { stylingSettings as radioGroupStylingSettings } from '../RadioGroup/RadioGroup.styling';
import { settings as radioButtonSettings } from '../legacy/RadioButton.settings';
import { settings as radioGroupSettings } from '../legacy/RadioGroup.settings';

const theme = createColorPinningTheme();

describe('RadioGroup color tokens', () => {
  it('pins RadioButton v0 colors', () => {
    expect(resolveV0ColorTokens(radioButtonSettings, theme)).toMatchSnapshot('RadioButton v0');
  });

  it('pins RadioGroup v0 colors', () => {
    expect(resolveV0ColorTokens(radioGroupSettings, theme)).toMatchSnapshot('RadioGroup v0');
  });

  it('pins Radio v1 colors', () => {
    expect(resolveV1ColorTokens(radioStylingSettings.tokens, theme)).toMatchSnapshot('Radio v1');
  });

  it('pins RadioGroup v1 colors', () => {
    expect(resolveV1ColorTokens(radioGroupStylingSettings.tokens, theme)).toMatchSnapshot('RadioGroup v1');
  });
});
