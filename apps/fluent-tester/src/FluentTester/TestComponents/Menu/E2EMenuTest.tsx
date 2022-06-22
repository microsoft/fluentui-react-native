import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Text } from '@fluentui-react-native/experimental-text';
import { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui-react-native/menu';
import {
  MENUITEM_ACCESSIBILITY_LABEL,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_TEST_LABEL,
  MENU_ON_CLOSE,
  MENU_ON_OPEN,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
} from './consts';

export const E2EMenuTest: React.FunctionComponent = () => {
  const [menuOpened, setMenuOpened] = React.useState(false);

  const onOpenChange = React.useCallback(
    (_e: any, isOpen: boolean) => {
      setMenuOpened(isOpen);
    },
    [setMenuOpened],
  );

  return (
    <Stack style={stackStyle}>
      <Menu open={menuOpened} onOpenChange={onOpenChange}>
        <MenuTrigger>
          <Button testID={MENUTRIGGER_TEST_COMPONENT}>Test</Button>
        </MenuTrigger>
        <MenuPopover testID={MENUPOPOVER_TEST_COMPONENT}>
          <MenuList>
            <MenuItem testID={MENUITEM_TEST_COMPONENT} accessibilityLabel={MENUITEM_ACCESSIBILITY_LABEL}>
              A plain MenuItem
            </MenuItem>
            <MenuItem disabled>A second disabled plain MenuItem</MenuItem>
            <MenuItem testID={MENUITEM_NO_A11Y_LABEL_COMPONENT}>{MENUITEM_TEST_LABEL}</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      {menuOpened ? <Text testID={MENU_ON_OPEN}>Menu opened</Text> : <Text testID={MENU_ON_CLOSE}>Menu closed</Text>}
    </Stack>
  );
};
