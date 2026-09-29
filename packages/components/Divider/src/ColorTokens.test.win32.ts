import { createColorPinningTheme, getColorTokenSnapshot } from '@fluentui-react-native/test-tools';

import { colorsFromAppearance } from './Divider.styling';
import type { DividerAppearance } from './Divider.types';
import { useDividerTokens } from './DividerTokens';

const appearances: DividerAppearance[] = ['default', 'subtle', 'brand', 'strong'];
const theme = createColorPinningTheme();

describe('Divider color tokens', () => {
  it('pins appearance colors', () => {
    const [tokens] = useDividerTokens(theme);
    const appearanceColors = Object.fromEntries(
      appearances.map((appearance) => [appearance, colorsFromAppearance(appearance, tokens, theme)]),
    );

    expect(getColorTokenSnapshot(appearanceColors, theme)).toMatchSnapshot();
  });
});
