import { createColorPinningTheme, resolveV0ColorTokens, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings as buttonStylingSettings } from './Button.styling';
import { stylingSettings as compoundButtonStylingSettings } from './CompoundButton/CompoundButton.styling';
import { stylingSettings as fabStylingSettings } from './FAB/FAB.styling';
import { stylingSettings as toggleButtonStylingSettings } from './ToggleButton/ToggleButton.styling';
import { settings as buttonSettings } from './deprecated/Button.settings';
import { settings as primaryButtonSettings } from './deprecated/PrimaryButton/PrimaryButton.settings';
import { settings as stealthButtonSettings } from './deprecated/StealthButton/StealthButton.settings';

const theme = createColorPinningTheme();

describe('Button color tokens', () => {
  it('pins v0 Button color tokens', () => {
    expect(resolveV0ColorTokens(buttonSettings, theme)).toMatchSnapshot();
  });

  it('pins v0 PrimaryButton color tokens', () => {
    expect(resolveV0ColorTokens(primaryButtonSettings, theme)).toMatchSnapshot();
  });

  it('pins v0 StealthButton color tokens', () => {
    expect(resolveV0ColorTokens(stealthButtonSettings, theme)).toMatchSnapshot();
  });

  it('pins v1 Button color tokens', () => {
    expect(resolveV1ColorTokens(buttonStylingSettings.tokens, theme)).toMatchSnapshot();
  });

  it('pins v1 CompoundButton color tokens', () => {
    expect(resolveV1ColorTokens(compoundButtonStylingSettings.tokens, theme)).toMatchSnapshot();
  });

  it('pins v1 FAB color tokens', () => {
    expect(resolveV1ColorTokens(fabStylingSettings.tokens, theme)).toMatchSnapshot();
  });

  it('pins v1 ToggleButton color tokens', () => {
    expect(resolveV1ColorTokens(toggleButtonStylingSettings.tokens, theme)).toMatchSnapshot();
  });
});
