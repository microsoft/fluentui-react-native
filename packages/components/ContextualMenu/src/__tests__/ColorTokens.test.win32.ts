import { createColorPinningTheme, resolveV0ColorTokens } from '@fluentui-react-native/test-tools';

import { settings as contextualMenuSettings } from '../ContextualMenu.settings';
import { settings as contextualMenuItemSettings } from '../ContextualMenuItem.settings';
import { settings as submenuSettings } from '../Submenu.settings';
import { settings as submenuItemSettings } from '../SubmenuItem.settings';

const theme = createColorPinningTheme();

describe('ContextualMenu color tokens', () => {
  it('pins menu colors', () => {
    expect(resolveV0ColorTokens(contextualMenuSettings, theme)).toMatchSnapshot('menu');
  });

  it('pins submenu colors', () => {
    expect(resolveV0ColorTokens(submenuSettings, theme)).toMatchSnapshot('submenu');
  });

  it('pins menu item colors', () => {
    expect(resolveV0ColorTokens(contextualMenuItemSettings, theme)).toMatchSnapshot('menu item');
  });

  it('pins submenu item colors', () => {
    expect(resolveV0ColorTokens(submenuItemSettings, theme)).toMatchSnapshot('submenu item');
  });
});
