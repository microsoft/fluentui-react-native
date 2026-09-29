import { createColorPinningTheme, resolveV0ColorTokens } from '@fluentui-react-native/test-tools';

import { settings } from '../Persona.settings';

const theme = createColorPinningTheme();

describe('Persona color tokens', () => {
  it('pins Persona colors', () => {
    expect(resolveV0ColorTokens(settings, theme)).toMatchSnapshot('Persona');
  });
});
