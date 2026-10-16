import { createColorPinningTheme, getColorTokenSnapshot, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings as menuDividerStylingSettings } from './MenuDivider/MenuDivider.styling';
import { stylingSettings as menuGroupHeaderStylingSettings } from './MenuGroupHeader/MenuGroupHeader.styling';
import { stylingSettings as menuItemStylingSettings } from './MenuItem/MenuItem.styling';
import { stylingSettings as menuItemCheckboxStylingSettings } from './MenuItemCheckbox/MenuItemCheckbox.styling';
import { stylingSettings as menuItemRadioStylingSettings } from './MenuItemRadio/MenuItemRadio.styling';
import { stylingSettings as menuListStylingSettings } from './MenuList/MenuList.styling';
import { useMenuPopoverTokens } from './MenuPopover/MenuPopoverTokens';

const theme = createColorPinningTheme();

describe('Menu color tokens', () => {
  it.each([
    ['MenuDivider', menuDividerStylingSettings.tokens],
    ['MenuGroupHeader', menuGroupHeaderStylingSettings.tokens],
    ['MenuItem', menuItemStylingSettings.tokens],
    ['MenuItemCheckbox', menuItemCheckboxStylingSettings.tokens],
    ['MenuItemRadio', menuItemRadioStylingSettings.tokens],
    ['MenuList', menuListStylingSettings.tokens],
  ])('pins %s colors', (_name, tokenSettings) => {
    expect(resolveV1ColorTokens(tokenSettings, theme)).toMatchSnapshot();
  });

  it('pins MenuPopover colors', () => {
    const [tokens] = useMenuPopoverTokens(theme);

    expect(getColorTokenSnapshot(tokens, theme)).toMatchSnapshot();
  });
});
